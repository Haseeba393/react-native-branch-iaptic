import React from 'react';
import type {
  T_BRANCH_IAP_PROVIDER_CONTEXT,
  T_BRANCH_IAP_PROVIDER_PROPS,
} from '../types';
import { isPlay } from 'react-native-iap/src/internal';
import {
  useIAP,
  PurchaseError,
  requestSubscription,
  endConnection,
  type Purchase,
} from 'react-native-iap';
import { errorLog, generateUserID } from '../utils';
import type { BranchParams } from 'react-native-branch';
import branch from 'react-native-branch';
import axios from 'axios';
import { btoa } from 'react-native-quick-base64';

export const BranchIapContext =
  React.createContext<T_BRANCH_IAP_PROVIDER_CONTEXT>({
    handleBuySubscription: (productId, offerToken) => {},
    subscriptions: [],
    iapLoading: false,
    isPurchased: false,
    isValidated: false,
    alreadyPurchased: false,
  });

const BranchIapProvider: React.FC<T_BRANCH_IAP_PROVIDER_PROPS> = ({
  children,
  iapSkus,
  iapticAppName,
  iapticSecretKey,
}) => {
  // Utilizing In App Purchase Hook
  const {
    connected,
    purchaseHistory,
    getPurchaseHistory,
    getSubscriptions,
    subscriptions,
    finishTransaction,
    currentPurchase,
    currentPurchaseError,
  } = useIAP();

  const [iapLoading, setIapLoading] = React.useState<boolean>(false);
  const [alreadyPurchased, setAlreadyPurchased] =
    React.useState<boolean>(false);
  const [isPurchased, setPurchased] = React.useState<boolean>(false);
  const [isValidated, setValidated] = React.useState<boolean>(false);
  const [branchParams, setBranchParams] = React.useState<
    BranchParams | undefined
  >(undefined);

  /* ------------------ IN APP PURCHASE STARTS HERE ------------------ */

  /**
   * This function is responsisble to
   * fetch the subscriptions
   */
  const handleGetSubscriptions = async () => {
    try {
      await getSubscriptions({ skus: iapSkus });
    } catch (error) {
      errorLog({ message: 'handleGetSubscriptions', error });
    }
  };

  // Effect to fetch purchase history
  // once the iap is connected
  React.useEffect(() => {
    if (connected) handleGetPurchaseHistory();
    return () => {
      endConnection();
    };
  }, [connected]);

  // Effect to fetch subscriptions
  // once the iap is connected
  React.useEffect(() => {
    if (connected) handleGetSubscriptions();
  }, [connected]);

  /**
   * This function is responsible to
   * fetch the purchase history
   */
  const handleGetPurchaseHistory = async () => {
    try {
      await getPurchaseHistory();
      if (purchaseHistory.length > 0) setAlreadyPurchased(true);
    } catch (error) {
      errorLog({ message: 'handleGetPurchaseHistory', error });
    }
  };

  /**
   * Function is responsible to
   * buy a subscription
   * @param {string} productId
   * @param {string} [offerToken]
   */
  const handleBuySubscription = async (
    productId: string,
    offerToken?: string
  ) => {
    if (isPlay && !offerToken) {
      console.warn(
        `There are no subscription Offers for selected product (Only requiered for Google Play purchases): ${productId}`
      );
    }
    try {
      setIapLoading(true);
      await requestSubscription({
        sku: productId,
        ...(offerToken && {
          subscriptionOffers: [{ sku: productId, offerToken }],
        }),
      });
    } catch (error) {
      setIapLoading(false);
      if (error instanceof PurchaseError) {
        errorLog({ message: `[${error.code}]: ${error.message}`, error });
      } else {
        errorLog({ message: 'handleBuySubscription', error });
      }
    }
  };

  /**
   * This function is responsible to
   * validate the transaction receipt
   * through IAPTIC validate API
   * @param {Purchase} jsonIapPurchase
   */
  const handlePurchaseValidation = async (jsonIapPurchase: Purchase) => {
    try {
      const userId = generateUserID();

      if (jsonIapPurchase && branchParams && userId) {
        await axios({
          method: 'POST',
          url: `https://validator.iaptic.com/v1/validate`,
          headers: {
            Authorization: `Basic ${btoa(
              `${iapticAppName}` + ':' + `${iapticSecretKey}`
            )}`,
          },
          data: {
            id: iapticAppName,
            type: 'application',
            transaction: {
              id: iapticAppName,
              type: 'ios-appstore',
              appStoreReceipt: jsonIapPurchase.transactionReceipt,
            },
            additionalData: {
              applicationUsername: `${branchParams[`~referring_link`]}/${userId}`,
            },
          },
        });
        setValidated(true);
      }
    } catch (error) {
      console.log('error', JSON.stringify(error));
    }
  };

  React.useEffect(() => {
    const checkCurrentPurchase = async () => {
      try {
        if (currentPurchase?.productId) {
          await handlePurchaseValidation(currentPurchase);

          await finishTransaction({
            purchase: currentPurchase,
            isConsumable: true,
          });
          setPurchased(true);
          setIapLoading(false);
        }
      } catch (error) {
        setIapLoading(false);
        if (error instanceof PurchaseError) {
          errorLog({ message: `[${error.code}]: ${error.message}`, error });
        } else {
          errorLog({ message: 'handleBuyProduct', error });
        }
      }
    };

    checkCurrentPurchase();
  }, [currentPurchase, finishTransaction]);

  // Hook
  React.useEffect(() => {
    const checkCurrentPurchaseError = async () => {
      if (currentPurchaseError) {
        setIapLoading(false);
        errorLog({
          message: 'checkCurrentPurchaseError',
          error: currentPurchaseError,
        });
      }
    };
    checkCurrentPurchaseError();
  }, [currentPurchaseError]);

  /* ------------------ IN APP PURCHASE ENDS HERE ------------------ */

  /* ------------------ BRANCH STARTS HERE ------------------ */

  // Hooks that will use for branch links
  React.useEffect(() => {
    const branchSubscription = branch.subscribe(async ({ error, params }) => {
      if (error) {
        errorLog({ message: `branchSubscription`, error: error });
        return;
      } else {
        setBranchParams(params);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (branchSubscription) {
        branchSubscription();
      }
    };
  }, []);

  /* ------------------ BRANCH ENDS HERE ------------------ */

  return (
    <BranchIapContext.Provider
      value={{
        handleBuySubscription,
        alreadyPurchased,
        iapLoading,
        isPurchased,
        isValidated,
        subscriptions,
      }}
    >
      {children}
    </BranchIapContext.Provider>
  );
};

export default BranchIapProvider;

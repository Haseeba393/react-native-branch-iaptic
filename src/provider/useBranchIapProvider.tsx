import React from 'react';
import { BranchIapContext } from './BranchIapProvider';

const useBranchIapProvider = () => {
  const {
    alreadyPurchased,
    handleBuySubscription,
    iapLoading,
    isPurchased,
    isValidated,
    subscriptions,
  } = React.useContext(BranchIapContext);
  return {
    alreadyPurchased,
    handleBuySubscription,
    iapLoading,
    isPurchased,
    isValidated,
    subscriptions,
  };
};

export default useBranchIapProvider;

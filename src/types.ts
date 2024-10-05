import React from 'react';
import { type Subscription } from 'react-native-iap';

export type T_BRANCH_IAP_PROVIDER_PROPS = {
  children: React.ReactNode;
  iapticAppName: string;
  iapticSecretKey: string;
  iapSkus: string[];
};

export type T_BRANCH_IAP_PROVIDER_CONTEXT = {
  subscriptions: Subscription[];
  handleBuySubscription: (productId: string, offerToken?: string) => void;
  iapLoading: boolean;
  isPurchased: boolean;
  isValidated: boolean;
  alreadyPurchased: boolean;
};

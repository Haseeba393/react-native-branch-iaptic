import { StyleSheet, View, Text, Platform, Button } from 'react-native';
import {
  BranchIapProvider,
  useBranchIapProvider,
} from 'react-native-branch-iaptic';

const IAP_SKUS = Platform.OS === 'android' ? [''] : ['oneMonthSubscriptionTwo'];

export default function App() {
  const {
    alreadyPurchased,
    handleBuySubscription,
    iapLoading,
    isPurchased,
    subscriptions,
  } = useBranchIapProvider();

  return (
    <BranchIapProvider
      iapSkus={IAP_SKUS}
      iapticAppName={`com.aks.projiaa`}
      iapticSecretKey={`98bfe0ba-bad8-4397-a26b-65000a91c228`}
    >
      <View style={styles.container}>
        <Text style={styles.msg}>{`Testing Branch Iaptic`}</Text>
        {subscriptions.length && (
          <Button
            onPress={() => {
              if (alreadyPurchased || iapLoading || isPurchased) return;
              //@ts-ignore
              handleBuySubscription(IAP_SKUS[0]);
            }}
            title={`${
              subscriptions.length
                ? // @ts-ignore
                  `Subscribe (${subscriptions[0].localizedPrice} / ${subscriptions[0].subscriptionPeriodUnitIOS})`
                : '...'
            }`}
          />
        )}
      </View>
    </BranchIapProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msg: {
    fontFamily: 'Couerier New',
    fontSize: 24,
    textAlign: 'center',
  },
});

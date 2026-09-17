import type { NetInfoState } from '@react-native-community/netinfo';

type ReachabilityState = Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>;

export function isNetworkOffline(state: ReachabilityState): boolean {
  return state.isConnected === false || state.isInternetReachable === false;
}

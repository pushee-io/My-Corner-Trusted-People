import { isNetworkOffline } from '../network-status';

describe('network status', () => {
  it('reports offline when the device has no connection', () => {
    expect(isNetworkOffline({ isConnected: false, isInternetReachable: null })).toBe(true);
  });

  it('reports offline when the connection cannot reach the internet', () => {
    expect(isNetworkOffline({ isConnected: true, isInternetReachable: false })).toBe(true);
  });

  it('does not show an offline state while reachability is unknown', () => {
    expect(isNetworkOffline({ isConnected: null, isInternetReachable: null })).toBe(false);
  });

  it('reports online when the internet is reachable', () => {
    expect(isNetworkOffline({ isConnected: true, isInternetReachable: true })).toBe(false);
  });
});

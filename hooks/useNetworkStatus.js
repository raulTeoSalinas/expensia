import { useEffect, useRef } from 'react'
import NetInfo from '@react-native-community/netinfo'

export function useNetworkStatus(onReconnect) {
  const wasOffline = useRef(false)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = !!(state.isConnected && state.isInternetReachable)

      if (!isOnline) {
        wasOffline.current = true
        return
      }

      // Only trigger onReconnect if we were previously offline
      if (wasOffline.current) {
        wasOffline.current = false
        onReconnect?.()
      }
    })

    return unsubscribe
  }, [onReconnect])
}

export async function getIsOnline() {
  const state = await NetInfo.fetch()
  return !!(state.isConnected && state.isInternetReachable)
}

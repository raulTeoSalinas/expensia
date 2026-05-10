import React from 'react'
import { ActivityIndicator } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuth } from '../context/authContext'

export default function SyncStatusIcon({ syncStatus, size = 12, tintColor }) {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) return null
  if (syncStatus === 'synced' || syncStatus === 'local') return null

  const pendingColor = tintColor ?? '#2706f9'

  if (syncStatus === 'pending') {
    return <ActivityIndicator size={size} color={pendingColor} />
  }

  if (syncStatus === 'failed') {
    return <MaterialCommunityIcons name="alert-circle" size={size + 2} color="#ff4444" />
  }

  return null
}

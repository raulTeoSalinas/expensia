import { useState, useRef } from 'react'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import { callAPI } from '../services/apiService'

export function useVoiceTransaction() {
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const recordingRef = useRef(null)

  const startRecording = async () => {
    const { granted } = await Audio.requestPermissionsAsync()
    if (!granted) throw new Error('Microphone permission denied')

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    })

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    )
    recordingRef.current = recording
    setIsRecording(true)
  }

  const stopAndParse = async () => {
    if (!recordingRef.current) return null

    setIsRecording(false)
    setIsLoading(true)

    try {
      await recordingRef.current.stopAndUnloadAsync()
      const uri = recordingRef.current.getURI()

      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      const { data, errorType } = await callAPI('/api/voice-parse', {
        method: 'POST',
        body: JSON.stringify({ audioBase64, mimeType: 'audio/m4a' }),
      })

      if (errorType) throw new Error(errorType)

      // { type, amount, globalCategoryId, customCategoryId, date, description, transcript }
      return data
    } finally {
      recordingRef.current = null
      setIsLoading(false)
    }
  }

  return { isRecording, isLoading, startRecording, stopAndParse }
}

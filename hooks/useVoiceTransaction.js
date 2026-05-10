import { useState, useRef, useEffect } from 'react'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system/legacy'
import { callAPI } from '../services/apiService'

// Returns local date as YYYY-MM-DD using the device timezone
function formatLocalDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function useVoiceTransaction() {
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [meteringDb, setMeteringDb] = useState(-160)
  const recordingRef = useRef(null)

  // Stop recording if the component unmounts while recording is active
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {})
        recordingRef.current = null
        Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {})
      }
    }
  }, [])

  const startRecording = async () => {
    const { granted } = await Audio.requestPermissionsAsync()
    if (!granted) throw new Error('Microphone permission denied')

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    })

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
      (status) => {
        if (status.metering == null) return
        setMeteringDb(status.metering)
      },
      100 // metering callback interval (ms)
    )
    recordingRef.current = recording
    setIsRecording(true)
  }

  const stopAndParse = async () => {
    if (!recordingRef.current) return null

    setIsRecording(false)
    setMeteringDb(-160)
    setIsLoading(true)

    try {
      const uri = recordingRef.current.getURI()

      try {
        await recordingRef.current.stopAndUnloadAsync()
      } catch (stopErr) {
        // Android may throw E_AUDIO_NODATA if the recording was too short
        // or captured no audio — surface a clear error to the user.
        throw new Error('Recording too short or no audio data')
      }

      if (!uri) throw new Error('Could not get recorded audio file URI')

      // Ensure the file exists and is non-empty before reading
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if (!fileInfo.exists || fileInfo.size === 0) {
        throw new Error('Audio file is empty or missing')
      }

      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      if (!audioBase64) throw new Error('Could not read audio file')

      const { data, errorType } = await callAPI('/api/voice-parse', {
        method: 'POST',
        body: JSON.stringify({
          audioBase64,
          mimeType: 'audio/m4a',
          clientDate: formatLocalDate(new Date()),
        }),
      })

      if (errorType) throw new Error(errorType)

      // { type, amount, globalCategoryId, customCategoryId, date, description, transcript }
      return data
    } finally {
      recordingRef.current = null
      setIsLoading(false)
      // Restore audio session for normal playback
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {})
    }
  }

  const cancelRecording = async () => {
    if (!recordingRef.current) return
    setIsRecording(false)
    setMeteringDb(-160)
    try {
      await recordingRef.current.stopAndUnloadAsync()
    } catch {
      // ignorar errores al cancelar
    } finally {
      recordingRef.current = null
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {})
    }
  }

  return { isRecording, isLoading, meteringDb, startRecording, stopAndParse, cancelRecording }
}

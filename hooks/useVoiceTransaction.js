import { useState, useRef, useEffect } from 'react'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system/legacy'
import { callAPI } from '../services/apiService'

// Devuelve la fecha local en formato YYYY-MM-DD, respetando el timezone del dispositivo
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

  // Limpia la grabación si el componente se desmonta mientras está activa
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
      100 // intervalo en ms
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
        // Android lanza E_AUDIO_NODATA si la grabación fue demasiado corta
        // o no capturó datos. Tratamos ese caso como error legible.
        throw new Error('Grabación demasiado corta o sin datos de audio')
      }

      if (!uri) throw new Error('No se pudo obtener el archivo de audio grabado')

      // Verificar que el archivo exista y tenga contenido antes de leerlo
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if (!fileInfo.exists || fileInfo.size === 0) {
        throw new Error('El archivo de audio está vacío o no existe')
      }

      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      if (!audioBase64) throw new Error('No se pudo leer el archivo de audio')

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
      // Restaurar modo de audio para reproducción normal
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

import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { callAPI } from '../services/apiService'

function formatLocalDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function readAsBase64(uri) {
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
}

export function useImageTransaction() {
  const [isLoading, setIsLoading] = useState(false)

  const parse = async (base64, mimeType, filename) => {
    setIsLoading(true)
    try {
      const { data, errorType } = await callAPI('/api/image-parse', {
        method: 'POST',
        body: JSON.stringify({
          fileBase64: base64,
          mimeType,
          filename,
          clientDate: formatLocalDate(new Date()),
        }),
      })
      if (errorType) throw new Error(errorType)
      // { type, amount, globalCategoryId, customCategoryId, idAccount, date, description }
      return data
    } finally {
      setIsLoading(false)
    }
  }

  const parseFromCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync()
    if (!granted) throw new Error('camera_permission_denied')

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    })
    if (result.canceled) return null

    const asset = result.assets[0]
    const b64 = asset.base64 ?? (await readAsBase64(asset.uri))
    return parse(b64, asset.mimeType ?? 'image/jpeg', 'photo.jpg')
  }

  const parseFromGallery = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!granted) throw new Error('gallery_permission_denied')

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    })
    if (result.canceled) return null

    const asset = result.assets[0]
    const b64 = asset.base64 ?? (await readAsBase64(asset.uri))
    return parse(b64, asset.mimeType ?? 'image/jpeg', asset.fileName ?? 'image.jpg')
  }

  const parseFromDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    })
    if (result.canceled) return null

    const asset = result.assets[0]
    const b64 = await readAsBase64(asset.uri)
    return parse(b64, 'application/pdf', asset.name ?? 'document.pdf')
  }

  return { isLoading, parseFromCamera, parseFromGallery, parseFromDocument }
}

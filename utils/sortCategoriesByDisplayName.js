/**
 * Sort categories by display name for the given language (case- and accent-insensitive).
 * @param {Array<{ nameEN?: string, nameES?: string }>} categories
 * @param {'en' | 'es'} [language='es']
 */
export function sortCategoriesByDisplayName(categories, language = 'es') {
  if (!categories?.length) return []
  const isEn = language === 'en'
  return [...categories].sort((a, b) => {
    const na = (isEn ? a.nameEN : a.nameES) || ''
    const nb = (isEn ? b.nameEN : b.nameES) || ''
    return na.localeCompare(nb, undefined, { sensitivity: 'base' })
  })
}

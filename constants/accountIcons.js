/**
 * Nombres de iconos de MaterialCommunityIcons (@expo/vector-icons) para elegir cuenta.
 * Debe coincidir con las claves del glyphmap del proyecto.
 * UI: 2 filas × 5 iconos (mantén el total alineado con ACCOUNT_ICONS_PER_ROW × número de filas).
 */
export const ACCOUNT_ICONS_PER_ROW = 5

export const ACCOUNT_ICON_OPTIONS = [
    'bank',
    'cash',
    'piggy-bank',
    'bitcoin',
    'credit-card-outline',
    'wallet',
    'cellphone',
    'finance',
    'briefcase',
    'storefront',
]

/** Filas de iconos para el selector (p. ej. 5 + 5). */
export function getAccountIconRows() {
    const rows = []
    for (let i = 0; i < ACCOUNT_ICON_OPTIONS.length; i += ACCOUNT_ICONS_PER_ROW) {
        rows.push(ACCOUNT_ICON_OPTIONS.slice(i, i + ACCOUNT_ICONS_PER_ROW))
    }
    return rows
}

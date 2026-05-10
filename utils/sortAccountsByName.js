/**
 * Ordena cuentas por nombre (insensible a mayúsculas / acentos).
 * @param {Array<{ id: string, name?: string }>} accounts
 * @returns {Array<{ id: string, name?: string }>}
 */
export function sortAccountsByName(accounts) {
    if (!accounts?.length) return []
    return [...accounts].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
    )
}

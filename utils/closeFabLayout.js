/**
 * Posición del botón cerrar (FAB esquina superior derecha), alineada con safe area.
 * Usar en TypeTransaction, IATransactions y cualquier modal similar.
 */
export function closeFabContainerStyle(insets) {
  return {
    position: 'absolute',
    top: insets.top + 15,
    right: 10,
    width: 60,
    height: 60,
  }
}

export const closeFabIconStyle = {
  resizeMode: 'contain',
  width: 50,
  height: 50,
}

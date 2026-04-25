export const CATEGORY_ICONS_PER_ROW = 7

export const CATEGORY_ICON_OPTIONS = [
  // built-in category icons
  'food-fork-drink', 'bus', 'home', 'television-play', 'cart', 'file-document',
  'tshirt-crew', 'bank-transfer', 'heart-pulse', 'paw', 'briefcase', 'store',
  'laptop', 'chart-line', 'percent',
  // extras
  'car', 'airplane', 'coffee', 'music', 'book-open',
  'gift', 'camera', 'dog', 'baby-carriage', 'medical-bag',
  'fuel', 'scissors-cutting', 'star', 'dumbbell', 'phone',
  'pizza', 'beer', 'swim', 'bike', 'basketball',
]

export function getCategoryIconRows() {
  const rows = []
  for (let i = 0; i < CATEGORY_ICON_OPTIONS.length; i += CATEGORY_ICONS_PER_ROW) {
    rows.push(CATEGORY_ICON_OPTIONS.slice(i, i + CATEGORY_ICONS_PER_ROW))
  }
  return rows
}

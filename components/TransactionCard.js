import { useContext, useMemo } from 'react'
import { TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native'
import Text from '@components/Text'
import Colors from '../constants/colors'
import formatNumberWithCommas from '../utils/formatNumberWithCommas'
import { es, en } from '../utils/languages'
import Category from '../utils/category'
import SyncStatusIcon from './SyncStatusIcon'
import { useNavigation } from '@react-navigation/native'
import { ExpensiaContext } from '../context/expensiaContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

/** @param {string} isoDate `YYYY-MM-DD` */
function formatLongDate(isoDate, locale) {
  if (!isoDate || typeof isoDate !== 'string') return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim())
  if (!m) return isoDate
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const dt = new Date(y, mo - 1, d)
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dt)
  } catch {
    return isoDate
  }
}

const TransactionCard = ({
  id,
  type,
  amount,
  date,
  description,
  syncStatus,
  accountName,
  accountIcon,
  globalCategoryId,
  customCategoryId,
  customCategoryName,
  customCategoryIcon,
}) => {
  const navigation = useNavigation()
  const { user } = useContext(ExpensiaContext)
  const strings = user?.language === 'en' ? en : es
  const locale = user?.language === 'en' ? 'en-US' : 'es-MX'

  const { categoryName, categoryIcon } = useMemo(() => {
    if (globalCategoryId) {
      const cat = Category.find((c) => c.id === globalCategoryId)
      return {
        categoryName: cat
          ? user?.language === 'en'
            ? cat.nameEN
            : cat.nameES
          : globalCategoryId,
        categoryIcon: cat?.icon ?? 'shape-outline',
      }
    }
    if (customCategoryId) {
      return {
        categoryName: customCategoryName ?? '',
        categoryIcon: customCategoryIcon || 'tag-outline',
      }
    }
    return { categoryName: '', categoryIcon: 'help-circle-outline' }
  }, [
    globalCategoryId,
    customCategoryId,
    customCategoryName,
    customCategoryIcon,
    user?.language,
  ])

  const isIncome = type === 'i'
  const amountColor = isIncome ? Colors.secondary : Colors.accent
  /** Izquierda → derecha: color de tipo dominante, luego transición suave al tono complementario del tema. */
  const typeHeaderGradientColors = useMemo(
    () =>
      isIncome
        ? [Colors.secondary, Colors.secondary, Colors.turquoise]
        : [Colors.accent, Colors.accent, Colors.expensePurpleEnd],
    [isIncome]
  )
  const typeHeaderGradientLocations = [0, 0.42, 1]
  const accountIconName = accountIcon || 'wallet-outline'
  const sign = isIncome ? '+' : '-'
  const absAmount = Math.abs(Number(amount))
  const amountText = `${sign}$${formatNumberWithCommas(absAmount)}`
  const dateLong = formatLongDate(date, locale)

  const descriptionDisplay =
    description && String(description).trim().length > 0
      ? description
      : strings.transactionCard.noDescription

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => navigation.navigate('Transaction', { id })}
    >
      <View style={styles.cardShadow}>
        <View style={styles.cardClip}>
        <LinearGradient
          colors={typeHeaderGradientColors}
          locations={typeHeaderGradientLocations}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.typeColorRow}
        >
          <View style={styles.typeColorRowInner}>
            <View style={styles.metaInline}>
              <View style={styles.metaChunk}>
                <View style={styles.categoryIconCircle}>
                  <MaterialCommunityIcons
                    name={categoryIcon}
                    size={15}
                    color={amountColor}
                  />
                </View>
                <Text
                  weight="bold"
                  color="white"
                  size="s"
                  numberOfLines={1}
                  style={styles.metaChunkText}
                >
                  {categoryName || '—'}
                </Text>
              </View>
              <View style={styles.metaChunk}>
                <MaterialCommunityIcons
                  name={accountIconName}
                  size={20}
                  color={Colors.white}
                  style={styles.metaChunkIcon}
                />
                <Text
                  weight="bold"
                  color="white"
                  size="s"
                  numberOfLines={1}
                  style={styles.metaChunkText}
                >
                  {accountName ?? ''}
                </Text>
              </View>
            </View>
            <SyncStatusIcon syncStatus={syncStatus} size={14} tintColor={Colors.white} />
          </View>
        </LinearGradient>

        <View style={styles.cardInner}>
          <Text weight="bold" size="xl" style={{ color: amountColor }}>
            {amountText}
          </Text>

          <Text size="s" numberOfLines={2} ellipsizeMode="tail" style={styles.descBlock}>
            {/* <Text size="s" color="placeholder">
              {strings.transactionCard.description}
            </Text> */}
            <Text size="s" color="primary">
              {descriptionDisplay}
            </Text>
          </Text>
        </View>

        <View style={styles.dateRowBlock}>
          <LinearGradient
            colors={typeHeaderGradientColors}
            locations={typeHeaderGradientLocations}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dateRowGradientTop}
          />
          <View style={styles.dateRow}>
            <View style={styles.dateRowContent}>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={18}
                color={amountColor}
                style={styles.dateRowIcon}
              />
              <Text weight="bold" color="primary" size="s" style={styles.dateRowText}>
                {dateLong}
              </Text>
            </View>
          </View>
        </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default TransactionCard

const styles = StyleSheet.create({
  /** Sombra: sin `overflow: hidden` para que iOS pueda dibujar fuera del rectángulo. */
  cardShadow: {
    alignSelf: 'stretch',
    width: width - 40,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  /** Recorte redondeado del contenido; la sombra vive en `cardShadow`. */
  cardClip: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.sheetBorder,
  },
  typeColorRow: {
    width: '100%',
  },
  typeColorRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardInner: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 10,
  },
  descBlock: {
    width: '100%',
  },
  metaInline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 0,
    columnGap: 12,
  },
  metaChunk: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    maxWidth: '47%',
    minWidth: 0,
  },
  categoryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  metaChunkIcon: {
    marginRight: 6,
  },
  metaChunkText: {
    flexShrink: 1,
    minWidth: 0,
  },
  dateRowBlock: {
    width: '100%',
  },
  dateRowGradientTop: {
    width: '100%',
    height: 2,
  },
  dateRow: {
    width: '100%',
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  dateRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    maxWidth: '100%',
  },
  dateRowIcon: {
    marginTop: 1,
  },
  dateRowText: {
    flexShrink: 1,
    textAlign: 'center',
  },
})

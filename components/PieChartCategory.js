// React / React-Native
import { useContext, useMemo, useState } from 'react'
import {
    View,
    StyleSheet,
    useWindowDimensions,
    Pressable,
    ScrollView,
    ActivityIndicator,
} from 'react-native'
import Text from '@components/Text'
import Colors from '../constants/colors'
import PieChart from 'react-native-pie-chart'
import Category from '../utils/category'
import formatNumberWithCommas from '../utils/formatNumberWithCommas'
import { es, en } from '../utils/languages'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { ExpensiaContext } from '../context/expensiaContext'
import { useCustomCategories, usePieChartCategoryTransactions } from '../hooks/queries'

const ACCORDION_TXN_MAX = 40

/**
 * Income: distinct blue→cyan stops (`Colors.incomeSpectrumPalette`). First slice = largest category (`secondary`),
 * last = smallest (`turquoise`). Same sampling idea as `generateExpenseSpectrumColors`.
 */
const generateIncomeSpectrumColors = (n) => {
    const pal = Colors.incomeSpectrumPalette
    if (n === 1) {
        return [Colors.secondary]
    }
    const maxIdx = pal.length - 1
    return Array.from({ length: n }, (_, i) => {
        const u = i / (n - 1)
        return pal[Math.round(u * maxIdx)]
    })
}

/**
 * Expenses: distinct pink→purple stops (`Colors.expenseSpectrumPalette`). First slice = largest category (accent pink),
 * last = smallest (deepest violet). Spreads indices across the palette so adjacent slices don’t look “the same”.
 */
const generateExpenseSpectrumColors = (n) => {
    const pal = Colors.expenseSpectrumPalette
    if (n === 1) {
        return [pal[0]]
    }
    const maxIdx = pal.length - 1
    return Array.from({ length: n }, (_, i) => {
        const u = i / (n - 1)
        return pal[Math.round(u * maxIdx)]
    })
}

/**
 * @param {Record<string, number>} data categoryId -> amount
 * @param {'e'|'i'} type
 * @param {string} [month] `YYYY-MM` — month shown on calendar; required for drill-down list
 */
const PieChartCategory = ({ data, type, month }) => {
    const { user } = useContext(ExpensiaContext)
    const strings = user && user.language === 'en' ? en : es
    const pieStrings = strings.pieChartCategory
    const { data: customCats = [] } = useCustomCategories()

    const windowDimensions = useWindowDimensions()
    const windowWidth = windowDimensions.width

    const isPortrait = windowDimensions.height > windowDimensions.width
    const useColumnLayout = isPortrait

    let chartWidth
    if (isPortrait) {
        chartWidth = Math.min(windowWidth * 0.38, 172)
    } else {
        chartWidth = windowWidth * 0.26
    }

    const dataKeys = Object.keys(data)
    const n = dataKeys.length
    const sliceColors =
        type === 'e' ? generateExpenseSpectrumColors(n) : generateIncomeSpectrumColors(n)

    const [selectedLegend, setSelectedLegend] = useState(null)

    const pieType = type === 'e' ? 'e' : 'i'

    const categoryIsCustom = useMemo(() => {
        if (!selectedLegend) return false
        const builtIn = Category.find((c) => c.id === selectedLegend.key)
        return !builtIn
    }, [selectedLegend])

    const { data: drillTransactions = [], isPending } = usePieChartCategoryTransactions(
        month ?? null,
        pieType,
        selectedLegend?.key ?? null,
        categoryIsCustom
    )

    const chartSliceColors = useMemo(() => {
        if (selectedLegend === null) return sliceColors
        return sliceColors.map((c, idx) =>
            idx === selectedLegend.index ? c : Colors.sheetHandle
        )
    }, [sliceColors, selectedLegend])

    const typeConfig = {}
    if (type === 'e') {
        typeConfig.textCircle = strings.transactionsScreen.selectTypeExpenses
    } else {
        typeConfig.textCircle = strings.transactionsScreen.selectTypeIncome
    }

    const displayedTx = drillTransactions.slice(0, ACCORDION_TXN_MAX)
    const hiddenCount = Math.max(0, drillTransactions.length - ACCORDION_TXN_MAX)

    return (
        <View style={[styles.pieChartMaincontainer, useColumnLayout && styles.pieChartMainColumn]}>
            <View style={[styles.pieChartWrapper, useColumnLayout && styles.pieChartWrapperColumn]}>
                <PieChart
                    widthAndHeight={chartWidth}
                    coverRadius={0.6}
                    series={Object.values(data)}
                    sliceColor={chartSliceColors}
                />
                <Text weight="bold" style={styles.pieChartText}>
                    {typeConfig.textCircle}
                </Text>
            </View>
            <View style={[styles.categoryContainer, useColumnLayout && styles.categoryContainerColumn]}>
                <View style={styles.legendTable}>
                    {dataKeys.map((tran, i) => {
                        const builtIn = Category.find((cat) => cat.id === tran)
                        const custom = !builtIn ? customCats.find((c) => c.id === tran) : null
                        const categoryName = builtIn
                            ? user?.language === 'en'
                                ? builtIn.nameEN
                                : builtIn.nameES
                            : custom?.name ?? tran
                        const categoryIcon = builtIn?.icon ?? custom?.icon ?? 'circle-outline'
                        const isLast = i === dataKeys.length - 1
                        const expandedHere = selectedLegend?.key === tran
                        const noBottomBorder = isLast && !expandedHere

                        return (
                            <Pressable
                                key={tran}
                                onPress={() => {
                                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    setSelectedLegend((prev) => {
                                        if (prev?.key === tran) return null
                                        return { key: tran, index: i }
                                    })
                                }}
                                style={({ pressed }) => [
                                    styles.legendRowWrap,
                                    noBottomBorder && styles.legendRowWrapLast,
                                    expandedHere && styles.legendRowWrapExpanded,
                                    pressed && !expandedHere && styles.legendRowWrapPressed,
                                ]}
                            >
                                <View style={styles.legendRow}>
                                    <View style={styles.legendCellCategory}>
                                        <View style={[styles.legendSwatch, { backgroundColor: sliceColors[i] }]}>
                                            <MaterialCommunityIcons name={categoryIcon} size={14} color={Colors.white} />
                                        </View>
                                        <Text
                                            weight="bold"
                                            size="s"
                                            style={styles.legendCategoryText}
                                            numberOfLines={2}
                                            color="primary"
                                        >
                                            {categoryName}
                                        </Text>
                                    </View>
                                    <View style={styles.legendColDivider} />
                                    <View style={styles.legendCellAmount}>
                                        <Text
                                            size="s"
                                            weight="bold"
                                            style={styles.legendAmountText}
                                            color="primary"
                                            numberOfLines={1}
                                            adjustsFontSizeToFit={!user?.isPrivacyEnabled}
                                            minimumFontScale={0.65}
                                            ellipsizeMode="tail"
                                        >
                                            {user?.isPrivacyEnabled
                                                ? '•••••'
                                                : `$${formatNumberWithCommas(Object.values(data)[i])}`}
                                        </Text>
                                    </View>
                                </View>

                                {expandedHere && month && (
                                    <View style={[styles.accordionPanel, { borderLeftColor: sliceColors[i] }]}>
                                        {isPending ? (
                                            <View style={styles.accordionLoading}>
                                                <ActivityIndicator size="small" color={sliceColors[i]} />
                                                <Text size="s" color="placeholder" style={{ marginTop: 6 }}>
                                                    {pieStrings.loadingList}
                                                </Text>
                                            </View>
                                        ) : drillTransactions.length === 0 ? (
                                            <Text size="s" color="placeholder" style={styles.accordionEmpty}>
                                                {pieStrings.emptyList}
                                            </Text>
                                        ) : (
                                            <ScrollView
                                                style={styles.accordionScroll}
                                                nestedScrollEnabled
                                                showsVerticalScrollIndicator={drillTransactions.length > 6}
                                            >
                                                {displayedTx.map((row) => {
                                                    const sign = row.type === 'i' ? '+' : '-'
                                                    const rowAmountColor =
                                                        row.type === 'i' ? Colors.secondary : Colors.accent
                                                    const amountText = user?.isPrivacyEnabled
                                                        ? '•••••'
                                                        : `${sign}$${formatNumberWithCommas(
                                                              Math.abs(Number(row.amount))
                                                          )}`
                                                    const desc = row.description?.trim() || '—'
                                                    return (
                                                        <View key={row.id} style={styles.txnRow}>
                                                            <Text weight="bold" size="s" color="primary" style={styles.txnDate}>
                                                                {row.date}
                                                            </Text>
                                                            <View style={styles.txnDescWrap}>
                                                                <Text
                                                                    size="s"
                                                                    color="primary"
                                                                    numberOfLines={1}
                                                                    ellipsizeMode="tail"
                                                                >
                                                                    {desc}
                                                                </Text>
                                                            </View>
                                                            <Text
                                                                size="s"
                                                                weight="bold"
                                                                style={{ color: rowAmountColor, flexShrink: 0 }}
                                                            >
                                                                {amountText}
                                                            </Text>
                                                        </View>
                                                    )
                                                })}
                                                {hiddenCount > 0 && (
                                                    <Text size="xs" color="placeholder" style={styles.moreFooter}>
                                                        {pieStrings.moreCount(hiddenCount)}
                                                    </Text>
                                                )}
                                            </ScrollView>
                                        )}
                                    </View>
                                )}
                            </Pressable>
                        )
                    })}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    pieChartMaincontainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        alignSelf: 'stretch',
        marginVertical: '2%',
    },
    pieChartMainColumn: {
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    pieChartWrapper: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    pieChartWrapperColumn: {
        alignSelf: 'center',
    },
    pieChartText: {
        position: 'absolute',
        zIndex: 1,
    },
    categoryContainer: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
        marginLeft: 10,
        flexShrink: 1,
    },
    categoryContainerColumn: {
        flex: 0,
        marginLeft: 0,
        marginTop: 10,
        width: '100%',
        alignSelf: 'stretch',
    },
    legendTable: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
        borderRadius: 10,
        overflow: 'hidden',
    },
    legendRowWrap: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.sheetBorder,
        backgroundColor: Colors.white,
    },
    legendRowWrapLast: {
        borderBottomWidth: 0,
    },
    legendRowWrapExpanded: {
        backgroundColor: Colors.light,
    },
    legendRowWrapPressed: {
        backgroundColor: 'rgba(242, 241, 251, 0.65)',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    legendCellCategory: {
        flex: 1,
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendCategoryText: {
        flex: 1,
        minWidth: 0,
        paddingRight: 4,
    },
    legendColDivider: {
        width: 1,
        marginHorizontal: 8,
        backgroundColor: Colors.sheetBorder,
        alignSelf: 'stretch',
    },
    legendCellAmount: {
        width: '32%',
        maxWidth: 112,
        flexShrink: 0,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    legendAmountText: {
        textAlign: 'right',
        width: '100%',
    },
    legendSwatch: {
        width: 24,
        height: 24,
        borderRadius: 6,
        marginRight: 10,
        flexShrink: 0,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    accordionPanel: {
        borderLeftWidth: 3,
        paddingHorizontal: 10,
        paddingBottom: 10,
        paddingTop: 4,
        backgroundColor: Colors.light,
    },
    accordionScroll: {
        maxHeight: 200,
    },
    accordionLoading: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    accordionEmpty: {
        paddingVertical: 10,
        textAlign: 'center',
    },
    txnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.sheetBorder,
    },
    txnDate: {
        flexShrink: 0,
        paddingRight: 6,
    },
    txnDescWrap: {
        flex: 1,
        minWidth: 0,
        marginLeft: 0,
        marginRight: 6,
    },
    moreFooter: {
        paddingTop: 8,
        paddingBottom: 4,
        textAlign: 'center',
    },
})

export default PieChartCategory

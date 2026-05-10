// React / React-Native
import { useContext, useMemo, useState } from "react";
import { View, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import Text from '@components/Text';
import Colors from '../constants/colors';
// Third Party Libraries
import PieChart from 'react-native-pie-chart';
// Utils
import Category from "../utils/category";
import formatNumberWithCommas from "../utils/formatNumberWithCommas";
import { es, en } from "../utils/languages";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
// Context
import { ExpensiaContext } from "../context/expensiaContext";
import { useCustomCategories } from "../hooks/queries";

/**
 * Income: distinct blue→cyan stops (`Colors.incomeSpectrumPalette`). First slice = largest category (`secondary`),
 * last = smallest (`turquoise`). Same sampling idea as `generateExpenseSpectrumColors`.
 */
const generateIncomeSpectrumColors = (n) => {
    const pal = Colors.incomeSpectrumPalette;
    if (n === 1) {
        return [Colors.secondary];
    }
    const maxIdx = pal.length - 1;
    return Array.from({ length: n }, (_, i) => {
        const u = i / (n - 1);
        return pal[Math.round(u * maxIdx)];
    });
};

/**
 * Expenses: distinct pink→purple stops (`Colors.expenseSpectrumPalette`). First slice = largest category (accent pink),
 * last = smallest (deepest violet). Spreads indices across the palette so adjacent slices don’t look “the same”.
 */
const generateExpenseSpectrumColors = (n) => {
    const pal = Colors.expenseSpectrumPalette;
    if (n === 1) {
        return [pal[0]];
    }
    const maxIdx = pal.length - 1;
    return Array.from({ length: n }, (_, i) => {
        const u = i / (n - 1);
        return pal[Math.round(u * maxIdx)];
    });
};

const PieChartCategory = ({ data, type }) => {

    const { user } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;
    const { data: customCats = [] } = useCustomCategories();

    const windowDimensions = useWindowDimensions();
    const windowWidth = windowDimensions.width;

    const isPortrait = windowDimensions.height > windowDimensions.width;
    /** Portrait: legend stacks below the chart and uses full width. */
    const useColumnLayout = isPortrait;

    let chartWidth;
    if (isPortrait) {
        chartWidth = Math.min(windowWidth * 0.38, 172);
    } else {
        chartWidth = windowWidth * 0.26;
    }

    const dataKeys = Object.keys(data);
    const n = dataKeys.length;
    // Income: sampled blue→turquoise palette (`incomeSpectrumPalette`). Expenses: pink→violet (`expenseSpectrumPalette`).
    const sliceColors = type === "e"
        ? generateExpenseSpectrumColors(n)
        : generateIncomeSpectrumColors(n);

    const [pressedLegendIndex, setPressedLegendIndex] = useState(null);

    const chartSliceColors = useMemo(() => {
        if (pressedLegendIndex === null) return sliceColors;
        return sliceColors.map((c, idx) =>
            idx === pressedLegendIndex ? c : Colors.sheetHandle
        );
    }, [sliceColors, pressedLegendIndex]);

    const typeConfig = {};

    if (type == "e") {
        typeConfig.textCircle = strings.transactionsScreen.selectTypeExpenses;
    } else {
        typeConfig.textCircle = strings.transactionsScreen.selectTypeIncome;
    }

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
                        const builtIn = Category.find((cat) => cat.id === tran);
                        const custom = !builtIn ? customCats.find((c) => c.id === tran) : null;
                        const categoryName = builtIn
                            ? (user?.language === 'en' ? builtIn.nameEN : builtIn.nameES)
                            : (custom?.name ?? tran);
                        const categoryIcon = builtIn?.icon ?? custom?.icon ?? 'circle-outline';
                        const isLast = i === dataKeys.length - 1;

                        return (
                            <Pressable
                                key={tran}
                                delayPressIn={0}
                                onPressIn={() => {
                                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    setPressedLegendIndex(i);
                                }}
                                onPressOut={() => setPressedLegendIndex(null)}
                                style={({ pressed }) => [
                                    styles.legendRow,
                                    isLast && styles.legendRowLast,
                                    pressed && styles.legendRowPressed,
                                ]}
                            >
                                <View style={styles.legendCellCategory}>
                                    <View style={[styles.legendSwatch, { backgroundColor: sliceColors[i] }]}>
                                        <MaterialCommunityIcons name={categoryIcon} size={14} color={Colors.white} />
                                    </View>
                                    <Text weight="bold" size="s" style={styles.legendCategoryText} numberOfLines={2} color="primary">
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
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    pieChartMaincontainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        alignSelf: "stretch",
        marginVertical: "2%",
    },
    pieChartMainColumn: {
        flexDirection: "column",
        alignItems: "stretch",
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
        justifyContent: "center",
        marginLeft: 10,
        flexShrink: 1,
    },
    categoryContainerColumn: {
        flex: 0,
        marginLeft: 0,
        marginTop: 10,
        width: "100%",
        alignSelf: "stretch",
    },
    legendTable: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
        borderRadius: 10,
        overflow: 'hidden',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.sheetBorder,
        backgroundColor: Colors.white,
    },
    legendRowLast: {
        borderBottomWidth: 0,
    },
    legendRowPressed: {
        backgroundColor: Colors.light,
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

});

export default PieChartCategory;
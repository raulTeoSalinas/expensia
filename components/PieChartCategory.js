// React / React-Native
import { useContext } from "react";
import { View, StyleSheet, Dimensions, useWindowDimensions } from 'react-native';
import Text from '@components/Text';
// Third Party Libraries
import PieChart from 'react-native-pie-chart';
//Utils
import Category from "../utils/category";
import Colors from "../constants/colors";
import formatNumberWithCommas from "../utils/formatNumberWithCommas";
import { es, en } from "../utils/languages";
// Context
import { ExpensiaContext } from "../context/expensiaContext";
import { useCustomCategories } from "../hooks/queries";

const PieChartCategory = ({ data, type }) => {

    const { user } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;
    const { data: customCats = [] } = useCustomCategories();

    const windowDimensions = useWindowDimensions();


    const isPortrait = windowDimensions.height > windowDimensions.width;
    let chartWidth = windowDimensions.width * 0.4; // Valor por defecto

    if (isPortrait) {
        chartWidth = windowDimensions.width * 0.45;
    } else {
        chartWidth = windowDimensions.width * 0.30;
    }

    const typeConfig = {};

    if (type == "e") {
        typeConfig.textCircle = strings.transactionsScreen.selectTypeExpenses;
        typeConfig.colorPie = "pieExpenses";

    } else {
        typeConfig.textCircle = strings.transactionsScreen.selectTypeIncome;
        typeConfig.colorPie = "pieIncome";

    }

    return (
        <View style={styles.pieChartMaincontainer}>
            <View style={styles.pieChartContainer}>
                <PieChart
                    widthAndHeight={chartWidth}
                    coverRadius={0.6}
                    series={Object.values(data)}
                    sliceColor={Colors[typeConfig.colorPie].slice(0, Object.values(data).length)}
                />
                <Text weight="bold" style={styles.pieChartText}>
                    {typeConfig.textCircle}
                </Text>
            </View>
            <View style={styles.categoryContainer}>
                {Object.keys(data).map((tran, i) => {
                    const builtIn = Category.find((cat) => cat.id === tran);
                    const custom = !builtIn ? customCats.find((c) => c.id === tran) : null;
                    const categoryName = builtIn
                        ? (user?.language === 'en' ? builtIn.nameEN : builtIn.nameES)
                        : (custom?.name ?? tran);

                    return (
                        <View key={tran} style={styles.categoryRow}>
                            <View style={[styles.colorIndicator, { backgroundColor: Colors[typeConfig.colorPie][i] }]}></View>
                            <View style={styles.categoryTextContainer}>
                                <Text weight="bold" style={styles.categoryName}>
                                    {categoryName}:
                                </Text>
                                <Text>
                                    ${formatNumberWithCommas(Object.values(data)[i])}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    pieChartMaincontainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginHorizontal: "2%",
        marginVertical: "2%"
    },
    pieChartContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pieChartText: {
        position: 'absolute',
        zIndex: 1,
    },
    categoryContainer: {
        justifyContent: "center",
        marginLeft: "1.5%",
    },
    categoryRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: "1.5%",
    },
    colorIndicator: {
        width: 8,
        height: 8,
        borderRadius: 2,
    },
    categoryTextContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexGrow: 1,
    },
    categoryName: {
        marginLeft: "2%",
    },

});

export default PieChartCategory;
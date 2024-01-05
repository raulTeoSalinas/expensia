// React / React-Native
import { useContext } from "react";
import { View, Text, StyleSheet, Dimensions, useWindowDimensions } from 'react-native';
// Third Party Libraries
import PieChart from 'react-native-pie-chart';
//Utils
import Category from "../utils/category";
import Colors from "../utils/colors";
import formatNumberWithCommas from "../utils/formatNumberWithCommas";
import { es, en } from "../utils/languages";
// Context
import { ExpensiaContext } from "../context/expensiaContext";

const PieChartCategory = ({ data, type }) => {

    const { user } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;

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
                <Text style={styles.pieChartText}>
                    {typeConfig.textCircle}
                </Text>
            </View>
            <View style={styles.categoryContainer}>
                {Object.keys(data).map((tran, i) => {
                    const category = Category.find((cat) => cat.id.toString() === tran);

                    return (
                        <View key={tran} style={styles.categoryRow}>
                            <View style={[styles.colorIndicator, { backgroundColor: Colors[typeConfig.colorPie][i] }]}></View>
                            <View style={styles.categoryTextContainer}>
                                <Text style={styles.categoryName}>
                                    {user && user.language === "en" ? category.nameEN : category.nameES}:
                                </Text>
                                <Text style={styles.transactionAmount}>
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
        fontFamily: 'poppins-bold',
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
        fontFamily: "poppins-bold",
    },
    transactionAmount: {
        fontFamily: "poppins",
    },

});

export default PieChartCategory;
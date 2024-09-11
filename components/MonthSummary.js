// React / React-Native
import { useContext } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
// Utils
import Colors from "../utils/colors";
import formatNumberWithCommas from "../utils/formatNumberWithCommas";
import { es, en } from "../utils/languages";
// Context
import { ExpensiaContext } from "../context/expensiaContext";


const MonthSummary = ({ income, expenses }) => {

    const { user } = useContext(ExpensiaContext);

    const strings = user && user.language === "en" ? en : es;

    let percentage = 0;

    if (income === 0 && expenses === 0) {
        percentage = 50;
    } else {
        percentage = Math.round(income / (income + expenses) * 100);
    }



    return (
        <View style={styles.mainContainer}>
            <Text style={styles.resumenTitle}>{strings.mainScreen.summaryTitle}</Text>
            <View style={styles.barsContainer}>
                <View style={[styles.incomeBar, { width: percentage + "%" }]}></View>
                <View style={styles.expensesBar}></View>
            </View>
            <View style={styles.resumenDescription}>
                <View style={styles.rowTitle}>
                    <View style={styles.dotIncome}></View>
                    <Text style={styles.textIncomeExpenses}>{strings.mainScreen.income}<Text> {user && !user.privacy ? `$${formatNumberWithCommas(income)}` : '•••••'}</Text></Text>
                </View>
                <View style={styles.rowTitle}>
                    <View style={styles.dotExpenses}></View>
                    <Text style={styles.textIncomeExpenses}>{strings.mainScreen.expenses}<Text> {user && !user.privacy ? `$${formatNumberWithCommas(expenses)}` : '•••••'}</Text></Text>
                </View>
            </View>
        </View>
    );
}

export default MonthSummary;

const styles = StyleSheet.create({
    mainContainer: {
        marginTop: '5%'
    },
    resumenTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        textAlign: "center",
        color: Colors.primary,

    },
    incomeBar: {
        backgroundColor: Colors.secondary,
        height: 5,
        width: '20%',
        borderBottomLeftRadius: 3,
        borderTopLeftRadius: 3
    },
    expensesBar: {
        backgroundColor: Colors.accent,
        height: 5,
        flex: 1,
        borderBottomRightRadius: 3,
        borderTopRightRadius: 3
    },
    barsContainer: {
        marginHorizontal: 25,
        marginVertical: 10,
        flexDirection: "row",
        height: 10
    },
    textIncomeExpenses: {
        fontFamily: 'Poppins-SemiBold',
        color: Colors.primary
    },
    resumenDescription: {
        flexDirection: "row",
        marginBottom: 15,
        justifyContent: 'space-around'
    },
    dotIncome: {
        height: 12,
        width: 12,
        borderRadius: 3,
        backgroundColor: Colors.secondary,
        marginRight: 7,
        marginBottom: Platform.OS === 'ios' ? 0 : 4,
    },
    dotExpenses: {
        height: 12,
        width: 12,
        borderRadius: 3,
        backgroundColor: Colors.accent,
        marginRight: 7,
        marginBottom: Platform.OS === 'ios' ? 0 : 4,
    },
    rowTitle: {
        flexDirection: 'row',
        alignItems: 'center'
    }

});
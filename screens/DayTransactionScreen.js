// React / React-Native
import { useLayoutEffect, useContext } from "react";
import { SafeAreaView, StyleSheet, FlatList, View } from "react-native";
import Text from '@components/Text';
// Utils
import Colors from "../constants/colors";
import { es, en } from "../utils/languages";
// Components
import HeaderTitle from "../components/HeaderTitle";
import TransactionCard from "../components/TransactionCard";
// Context
import { ExpensiaContext } from "../context/expensiaContext";


const DayTransactionScreen = ({ route, navigation }) => {

    const dayClicked = route.params.dateString;

    const { transactions, user } = useContext(ExpensiaContext);

    const strings = user && user.language === "en" ? en : es;

    useLayoutEffect(() => {
        navigation.setOptions({
            title: ` ${dayClicked}`,
            headerTitle: ({ children }) => <HeaderTitle title={strings.transactionsScreen.headerGradientTxt} children={children} />
        })

    }, [])

    // Filtrar las transacciones por la fecha clickeada
    const filteredTransactions = transactions.filter(transaction => transaction.date === dayClicked);


    return (
        <SafeAreaView style={styles.mainContainer}>

            <FlatList
                data={filteredTransactions}
                key={(item) => item.id}
                contentContainerStyle={{ alignItems: 'center', paddingTop: 10 }}
                renderItem={({ item }) =>
                    <TransactionCard
                        id={item.id}
                        type={item.type}
                        amount={item.amount}
                        account={item.account}
                        date={item.date}
                        category={item.category}
                        description={item.description}

                    />}
                numColumns={1}
                ListEmptyComponent={() => (
                    <View>
                        <Text>{strings.transactionsScreen.emptyListTxt}</Text>
                    </View>
                )}
            />


        </SafeAreaView >
    );
}

export default DayTransactionScreen;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.light,
        flexDirection: "row"

    },
});
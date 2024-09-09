// React / React-Native
import { useState, useContext, useEffect } from "react";
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TextInput,
    Dimensions,
    FlatList,
    Platform
} from "react-native";
// Utils
import Colors from "../utils/colors";
import sortTransactionsByDate from "../utils/sortTransactionsByDate";
import filterTransactionsByType from "../utils/filterTransactionsByType";
import { es, en } from "../utils/languages";
// Components
import SelectType from "../components/SelectType";
import TransactionCard from "../components/TransactionCard";
import Header from "../components/Header";
// Icons
import { Ionicons } from '@expo/vector-icons';
// Context
import { ExpensiaContext } from "../context/expensiaContext";

const { width } = Dimensions.get('window')

const TransactionsScreen = ({ navigation }) => {




    const { transactions, user } = useContext(ExpensiaContext);
    const [transactionsDisplay, setTransactionsDisplay] = useState([]);
    const [selectedType, setSelectedType] = useState('all')
    const [txtSearch, setTxtSearch] = useState('');
    const strings = user && user.language === "en" ? en : es;

    useEffect(() => {
        let sortedTransactions = filterTransactionsByType(sortTransactionsByDate(transactions), selectedType);

        if (txtSearch !== '') {
            sortedTransactions = sortedTransactions.filter((transaction) =>
                transaction.description.toLowerCase().includes(txtSearch.toLowerCase())
            );
        }
        setTransactionsDisplay(sortedTransactions)

    }, [transactions, selectedType, txtSearch]);

    const getTypeSelected = (type) => {
        setSelectedType(type)
    };

    const handleChangeTxtSearch = (inputText) => {
        setTxtSearch(inputText);
    }

    const handleFloatBtnNavigate = () => {
        navigation.navigate("TypeTransaction")
    }

    return (
        <SafeAreaView style={styles.mainContainer}>

            <Header darkText={strings.transactionsScreen.headerDarkTxt} gradientText={strings.transactionsScreen.headerGradientTxt} addBtn />

            <View style={{ alignItems: 'center' }}>
                <View style={styles.txtSearchContainer}>
                    <TextInput
                        style={styles.txtSearch}
                        onChangeText={handleChangeTxtSearch}
                        value={txtSearch}
                        inputMode='text'
                        returnKeyType='done'
                        placeholder={strings.transactionsScreen.searchPlaceHolder}
                        blurOnSubmit

                    />
                    <Ionicons name="search" size={24} color="black" style={{ marginRight: 15 }} />
                </View>
            </View>


            <SelectType getTypeSelected={getTypeSelected} />

            <FlatList
                data={transactionsDisplay}
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
                        <Text style={{ fontFamily: 'poppins' }}>{strings.transactionsScreen.emptyListTxt}</Text>
                    </View>
                )}
            />


        </SafeAreaView>
    );
}

export default TransactionsScreen;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.light,
    },
    welcomeContainer: {
        flexDirection: "row",

        alignItems: "center",
        marginLeft: '8%',
        marginRight: '2%',
        justifyContent: 'space-between'
    },
    welcome: {
        fontSize: 25,
        marginTop: Platform.OS === 'ios' ? 0 : 40,
        fontFamily: 'poppins-bold',
        color: Colors.primary
    },
    buttonIcon: {
        resizeMode: 'contain',
        width: 50,
        height: 50,
    },
    opacity: {
        width: 60,
        height: 60,
        marginTop: Platform.OS === 'ios' ? 0 : 30,
    },
    txtSearch: {

        height: 40,

        paddingHorizontal: 15,
        fontFamily: 'poppins',
        fontSize: 15,
        width: '90%',

        color: Colors.primary
    },
    txtSearchContainer: {
        backgroundColor: 'white',
        borderColor: Colors.secondary,
        borderWidth: 0.5,
        width: width - 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        justifyContent: 'space-between'
    }


});
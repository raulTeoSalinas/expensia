//React / React-Native
import { useState, useContext, useEffect } from "react";
import {
    Keyboard,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    Alert
} from "react-native";
//Icons
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from '@expo/vector-icons';
//Components
import ModalSelect from "../components/ModalSelect";
import ModalSelectCategory from "../components/ModalSelectCategory";
import ModalDate from "../components/ModalDate";
import ModalDeleteTran from "../components/ModalDeleteTran";
import GradientText from "../components/TextGradient";
import HeaderTitle from "../components/HeaderTitle";
//Utils
import getCurrentDate from "../utils/getCurrentDay";
import getNextId from "../utils/getNextId";
import Colors from "../utils/colors";
import { es, en } from "../utils/languages";
//Context
import { ExpensiaContext } from "../context/expensiaContext";
// AsyncStorage
import expensiaAsyncStorage from "../context/expensiaAsyncStorage";
//Categories
import Category from "../utils/category";


const TransactionScreen = ({ navigation, route }) => {

    const { addTransaction, transactions, editTransaction, removeTransaction, user, addOrRestAmount } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;

    const idTransactionClicked = route.params && route.params.id ? route.params.id : null;

    const { addTransactionAsync, editTransactionAsync, deleteTransactionAsync, addOrRestAmountAsync } = expensiaAsyncStorage;

    const [modalDeleteTranVisible, setModalDeleteTranVisible] = useState(false);

    //Modal select
    const [modalSelectVisible, setModalSelectVisible] = useState(false);

    const [modalSelectCategoryVisible, setModalSelectCategoryVisible] = useState(false);

    const [userAccounts, setUserAccounts] = useState([]);
    const [selectedValue, setSelectedValue] = useState("");

    const [selectedCategory, setSelectedCategory] = useState();

    const [typeTrans, setTypeTrans] = useState(false)

    useEffect(() => {
        if (idTransactionClicked) {
            const transactionClicked = transactions.find((tran) => tran.id === idTransactionClicked);

            if (transactionClicked) {
                setTypeTrans(transactionClicked.type); // Make sure the transaction is found
            }
        } else {
            const typeTransParam = route.params?.typeTrans || null; // Use optional chaining for safer access
            setTypeTrans(typeTransParam);
        }
    }, [idTransactionClicked, transactions, route.params]);


    useEffect(() => {
        setUserAccounts(user.accounts);
        setSelectedValue(user.accounts[0])
    }, [user])

    const handleSelectedModal = (selectedFromModal) => {
        setSelectedValue(selectedFromModal);
    }

    const handleSelectedCategory = (selectedFromModal) => {
        setSelectedCategory(selectedFromModal);
    }

    //Modal Date
    const [modalDateVisible, setModalDateVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(getCurrentDate);

    //InputDescription
    const [txtDescription, setTxtDescription] = useState('');
    const handleChangeTxtDescription = (inputText) => {
        setTxtDescription(inputText);
    }

    //InputAmount
    const [text, setText] = useState('');

    //Format Amount while changing text
    const handleChangeText = (inputText) => {
        if (inputText === '') {
            setText('');
            return;
        }
        // Remove non-numeric characters except decimal points.
        const numericValue = inputText.replace(/[^0-9.]/g, '');

        // Validate the format of the decimal number.
        const parts = numericValue.split('.');
        if (parts.length > 2) {
            return;
        }
        if (parts.length === 2 && parts[1].length > 2) {
            return;
        }

        const formattedText = numericValue
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            .toLocaleString('en-US');

        setTxtEmptyLoad(true)
        setText(formattedText);
    };

    const [isSaving, setIsSaving] = useState(false);
    const [txtEmpyLoad, setTxtEmptyLoad] = useState(true);

    const onPressDelete = async () => {
        const transactionClicked = transactions.find((tran) => tran.id === idTransactionClicked);
        removeTransaction(idTransactionClicked);
        deleteTransactionAsync(idTransactionClicked);
        switch (transactionClicked.type) {
            case "i": addOrRestAmount(transactionClicked.amount, "e", transactionClicked.account); // type "e" to delete amount from account
                await addOrRestAmountAsync(transactionClicked.amount, "e", transactionClicked.account);
                break;
            case "e": addOrRestAmount(transactionClicked.amount, "i", transactionClicked.account); // type "i" to add amount from account
                await addOrRestAmountAsync(transactionClicked.amount, "i", transactionClicked.account);
                break;
            case "l": addOrRestAmount(transactionClicked.amount, "i", transactionClicked.account);
                await addOrRestAmountAsync(transactionClicked.amount, "i", transactionClicked.account);
                break
        }
        navigation.goBack();
    }

    useEffect(() => {

        if (typeTrans) {
            switch (typeTrans) {
                case "i": navigation.setOptions({ title: strings.transactionScreen.headerIncome });

                    break;
                case "e": navigation.setOptions({ title: strings.transactionScreen.headerExpense });
                    break;
                case "l": navigation.setOptions({ title: strings.transactionScreen.headerLoan });
                    break
            }
            navigation.setOptions({
                headerTitle: ({ children }) => <HeaderTitle title={strings.transactionScreen.headerRegister} children={children} />
            })
            const categories = Category.filter(category => category.type === typeTrans);
            setSelectedCategory(categories[0]);
        }

    }, [typeTrans])


    useEffect(() => {
        if (idTransactionClicked) {
            const transactionClicked = transactions.find((tran) => tran.id === idTransactionClicked);
            setText(transactionClicked.amount);
            setSelectedValue(transactionClicked.account);
            setSelectedDate(transactionClicked.date);
            setTxtDescription(transactionClicked.description);
            setSelectedCategory(transactionClicked.category);

            navigation.setOptions({
                headerTitle: ({ children }) => (
                    <>
                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 20, color: Colors.primary }}>
                            {strings.transactionScreen.headerEdit}
                        </Text>
                        <GradientText style={{ fontFamily: 'Poppins-SemiBold', fontSize: 20 }}>{children}</GradientText></>),
                headerRight: () => (
                    <TouchableOpacity onPress={() => setModalDeleteTranVisible(!modalDeleteTranVisible)}>
                        <Ionicons name="trash-outline" size={24} color="red" />
                    </TouchableOpacity>

                ),
            })

            switch (transactionClicked.type) {
                case "i": navigation.setOptions({ title: strings.transactionScreen.headerIncome });
                    break;
                case "e": navigation.setOptions({ title: strings.transactionScreen.headerExpense });
                    break;
                case "l": navigation.setOptions({ title: strings.transactionScreen.headerLoan });
                    break
            }

        }
    }, []);

    const handleSaveAndGoBack = async () => {
        console.log(selectedValue)
        if (text === '' || text === '.') {
            setTxtEmptyLoad(false)
        } else {
            const amount = text.replace(/,/g, '');
            if (amount > selectedValue.amount && typeTrans !== "i" && !selectedValue?.isCC) {
                Alert.alert("Transacción Fallida", "No tienes suficientes fondos en la cuenta seleccionada.")
            } else {
                setIsSaving(true)

                //Data to create Transaction
                let id;
                let type = '';

                const account = selectedValue;
                const date = selectedDate;
                const description = txtDescription;
                const category = selectedCategory;

                if (!idTransactionClicked) {
                    id = await getNextId();
                    type = typeTrans;
                    addTransactionAsync(id, type, amount, account, date, category, description);
                    addTransaction(id, type, amount, account, date, category, description);
                    addOrRestAmount(amount, type, account);
                    await addOrRestAmountAsync(amount, type, account);
                    navigation.goBack();
                } else {
                    const transactionClicked = transactions.find((tran) => tran.id === idTransactionClicked);
                    console.log(transactionClicked.account.id)
                    console.log(account.id)
                    if (transactionClicked.account.id === account.id) {
                        id = idTransactionClicked;
                        type = transactionClicked.type;
                        editTransactionAsync(id, type, amount, account, date, category, description);
                        editTransaction(id, type, amount, account, date, category, description);
                        const editedAmount = amount - transactions.find((tran) => tran.id === idTransactionClicked)?.amount;
                        addOrRestAmount(editedAmount, type, account);
                        await addOrRestAmountAsync(editedAmount, type, account);
                    } else {
                        id = idTransactionClicked;
                        type = transactionClicked.type;
                        editTransactionAsync(id, type, amount, account, date, category, description);
                        editTransaction(id, type, amount, account, date, category, description);
                        addOrRestAmount(amount, type, account);
                        await addOrRestAmountAsync(amount, type, account);
                        switch (transactionClicked.type) {
                            case "i": addOrRestAmount(transactionClicked.amount, "e", transactionClicked.account); // type "e" to delete amount from account
                                await addOrRestAmountAsync(transactionClicked.amount, "e", transactionClicked.account);
                                break;
                            case "e": addOrRestAmount(transactionClicked.amount, "i", transactionClicked.account); // type "i" to add amount from account
                                await addOrRestAmountAsync(transactionClicked.amount, "i", transactionClicked.account);
                                break;
                            case "l": addOrRestAmount(transactionClicked.amount, "i", transactionClicked.account);
                                await addOrRestAmountAsync(transactionClicked.amount, "i", transactionClicked.account);
                                break
                        }
                    }

                    navigation.goBack();
                }
            }
        }
    };

    return (
        <SafeAreaView style={styles.mainContainer}>
            <ScrollView>
                <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }} >
                    <View style={styles.row}>
                        <Text style={styles.label}>{strings.transactionScreen.amount}</Text>
                        <View style={{ flexDirection: "row", alignItems: 'center' }}>
                            <MaterialIcons name="attach-money" size={24} color={Colors.primary} />
                            <TextInput
                                style={[styles.txtInput, txtEmpyLoad ? null : { borderColor: 'red', borderWidth: 2 }]}
                                onChangeText={handleChangeText}
                                value={text}
                                keyboardType="decimal-pad"
                                returnKeyType='done'
                            />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>{strings.transactionScreen.account}</Text>
                        <TouchableOpacity activeOpacity={0.5} style={styles.viewFakeInput} onPress={() => setModalSelectVisible(!modalSelectVisible)}>
                            <Text style={styles.txtFakeInput}>{selectedValue.name}</Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>{strings.transactionScreen.date}</Text>
                        <TouchableOpacity activeOpacity={0.5} style={styles.viewFakeInput} onPress={() => setModalDateVisible(!modalDateVisible)}>
                            <Text style={styles.txtFakeInput}>{selectedDate}</Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>{strings.transactionScreen.category}</Text>
                        <TouchableOpacity activeOpacity={0.5} style={styles.viewFakeInput} onPress={() => setModalSelectCategoryVisible(!modalSelectCategoryVisible)}>
                            <Text style={styles.txtFakeInput}>
                                {
                                    selectedCategory?.nameEN && user && user.language === "en"
                                        ? selectedCategory.nameEN.length > 10
                                            ? selectedCategory.nameEN.substring(0, 10) + "..."
                                            : selectedCategory.nameEN
                                        : selectedCategory?.nameES && selectedCategory.nameES.length > 10
                                            ? selectedCategory.nameES.substring(0, 10) + "..."
                                            : selectedCategory?.nameES
                                }
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginTop: '8%', marginHorizontal: '9%' }}>
                        <Text style={[styles.label, { marginBottom: 10 }]}>{strings.transactionScreen.description} <Text style={{ fontFamily: 'Poppins-Light' }}>{strings.transactionScreen.optional}</Text></Text>
                        <TextInput
                            style={[styles.txtInput, styles.txtDescription]}
                            onChangeText={handleChangeTxtDescription}
                            multiline
                            inputMode='text'
                            blurOnSubmit
                            value={txtDescription}
                            returnKeyType='done'
                            maxLength={125}
                        />
                    </View>

                    <TouchableOpacity style={styles.touchBtn} onPress={handleSaveAndGoBack}>
                        <View style={[styles.btnContainer, isSaving && { backgroundColor: Colors.accent }]}>
                            <Text style={styles.txtBtn}>{isSaving ? strings.transactionScreen.savingTxt : strings.transactionScreen.saveBtn}</Text>
                        </View>
                    </TouchableOpacity>


                </Pressable>
                <ModalSelectCategory modalVisible={modalSelectCategoryVisible} setModalVisible={setModalSelectCategoryVisible} selectedValue={selectedCategory} handleSelectedModal={handleSelectedCategory} />
                <ModalSelect modalVisible={modalSelectVisible} setModalVisible={setModalSelectVisible} data={userAccounts} selectedValue={selectedValue} handleSelectedModal={handleSelectedModal} />
                <ModalDate modalVisible={modalDateVisible} setModalVisible={setModalDateVisible} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                <ModalDeleteTran modalVisible={modalDeleteTranVisible} setModalVisible={setModalDeleteTranVisible} onPressDelete={onPressDelete} />
            </ScrollView>



        </SafeAreaView>
    );
}

export default TransactionScreen;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.light,

    },
    header: {
        flexDirection: "row",
        paddingHorizontal: '2%',
        backgroundColor: Colors.primary
    },
    cardTotals: {
        marginTop: '5%',
        marginBottom: "5%",
        marginHorizontal: 20,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        borderColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 7.49,

        elevation: 12,
    },
    label: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 18,
        color: Colors.primary,
    },
    txtInput: {
        backgroundColor: 'white',
        height: 40,
        width: 150,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontFamily: 'Poppins-Light',
        fontSize: 15,
        borderWidth: 0.5,
        borderColor: Colors.secondary,
        color: Colors.primary
    },
    row: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8%',
        marginHorizontal: '9%'
    },
    viewFakeInput: {
        backgroundColor: 'white',
        height: 40,
        width: 150,
        borderRadius: 10,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 0.5,
        borderColor: Colors.secondary,

    },
    txtFakeInput: {
        fontFamily: 'Poppins-Light',
        fontSize: 15,
        color: Colors.primary

    },
    btnContainer: {
        backgroundColor: Colors.secondary,
        paddingVertical: 10,
        width: 120,
        borderRadius: 10

    },
    txtBtn: {
        fontFamily: 'Poppins-Light',
        color: Colors.light,
        textAlign: 'center'
    },
    txtDescription: {
        width: '100%',
        height: 150,
        textAlignVertical: "top",
        paddingTop: 15,
        paddingBottom: 15
    },
    touchBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '10%'
    }


})
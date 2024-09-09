// React / React-Native
import { useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Modal,
    Image,
    ScrollView
} from "react-native";
import { Asset } from "expo-asset";
// Utils
import Colors from "../utils/colors";
import { es, en } from "../utils/languages";
// Components
import GradientText from "../components/TextGradient";
// Icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
// AsyncStorage
import expensiaAsyncStorage from "../context/expensiaAsyncStorage";
// Context
import { ExpensiaContext } from "../context/expensiaContext";


const CreateAccountsScreen = ({ navigation, route }) => {

    const userName = route.params.userName;

    const language = route.params.language

    const strings = language === "en" ? en : es;

    const { createUser } = useContext(ExpensiaContext);
    const { createUserAsync } = expensiaAsyncStorage;

    const initialAccounts = [
        { id: 1, name: strings.createAccountsScreen.bank, icon: 'bank', amount: '' },
        { id: 2, name: strings.createAccountsScreen.cash, icon: 'cash', amount: '' },
        { id: 3, name: strings.createAccountsScreen.savings, icon: 'piggy-bank', amount: '' }
    ];
    const [accounts, setAccounts] = useState(initialAccounts)

    const [modalVisible, setModalVisible] = useState(false)

    const handleChangeAmount = (id, inputText) => {
        if (inputText === '') {
            setAccounts(prevAccounts => {
                return prevAccounts.map(account => {
                    if (account.id === id) {
                        return { ...account, amount: '' };
                    }
                    return account;
                });
            });
            return;
        }

        // Remove non-numeric characters except decimal points.
        const numericValue = inputText.replace(/[^0-9.]/g, '');

        // Validate the format of the decimal number.
        const parts = numericValue.split('.');
        if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) {
            return;
        }

        const formattedText = numericValue
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            .toLocaleString('en-US');

        setAccounts(prevAccounts => {
            return prevAccounts.map(account => {
                if (account.id === id) {
                    return { ...account, amount: formattedText };
                }
                return account;
            });
        });

    };

    const handleDeleteAccount = (id) => {
        setAccounts(prevAccounts => {
            return prevAccounts.filter(account => account.id !== id);
        });
    };

    const handleCancelButton = () => {
        setModalVisible(!modalVisible)
    }


    const [txtAccount, setTxtAccount] = useState('');

    const [txtAccountEmptyLoad, setTxtAccountEmptyLoad] = useState(true);

    const handleChangeTxtAccount = (inputText) => {
        setTxtAccount(inputText)
        setTxtAccountEmptyLoad(true)
    }

    const [selectedIcon, setSelectedIcon] = useState('bank');

    const handleAddAccount = () => {
        if (txtAccount == "") {
            setTxtAccountEmptyLoad(false)
        } else {
            const newAccount = {
                id: accounts.length - 1 == -1 ? 1 : accounts[accounts.length - 1].id + 1, //This its to get the nextId
                name: txtAccount,
                icon: selectedIcon,
                amount: ""
            }
            setAccounts(prevAccounts => [...prevAccounts, newAccount]);
            setModalVisible(!modalVisible)
            console.log(newAccount.id)
        }
    }

    const handleCreateUser = () => {
        // Filter and modify accounts.
        const accountsRightAmount = accounts.map((account) => {
            let amount = account.amount;

            // Remove commas from the quantity.
            amount = amount.replace(/,/g, '');

            // Convert to zero if it is an empty string or a dot.
            if (amount === '' || amount === '.') {
                amount = '0';
            }

            // Return the modified account.
            return { ...account, amount };
        });

        createUserAsync(userName, accountsRightAmount, language);
        createUser(userName, accountsRightAmount, language)

    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.mainContainer}>


                <View style={{ flexDirection: 'row', paddingHorizontal: 30 }}>
                    <Text style={styles.txtWelcome}>{strings.createAccountsScreen.welcome}</Text>
                    <GradientText style={styles.txtWelcome}>{userName}</GradientText>
                </View>
                <Text style={{ color: Colors.primary, fontFamily: 'poppins', fontSize: 18, textAlign: 'justify', marginTop: 7, paddingHorizontal: 30 }}>{strings.createAccountsScreen.registerTxt}</Text>
                {accounts.map((account, i) => (
                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={styles.cardTotals}>
                            <View style={styles.row}>
                                <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                    <MaterialCommunityIcons name={account.icon} size={24} color={Colors.accent} />
                                    <Text style={styles.txtAccount}>{account.name}</Text>
                                </View>
                                <View>
                                    <View style={{ flexDirection: 'row', backgroundColor: 'white', borderRadius: 10, justifyContent: 'center', alignItems: "center", padding: 4 }}>
                                        <MaterialIcons name="attach-money" size={20} color={Colors.primary} />
                                        <TextInput
                                            style={[styles.txtInput]}
                                            onChangeText={handleChangeAmount.bind(null, account.id)}
                                            value={account.amount}
                                            returnKeyType='done'
                                            keyboardType="decimal-pad"
                                            placeholder="0.00"
                                            blurOnSubmit
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity onPress={handleDeleteAccount.bind(null, account.id)}>
                            <MaterialCommunityIcons name="trash-can-outline" size={28} color="red" style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </View>
                ))}
                <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity style={styles.opacity} onPress={() => { setModalVisible(!modalVisible); setTxtAccount("") }} >
                        <Image style={styles.buttonIcon} source={require('../assets/images/icon-plus.png')} />
                        <Text style={{ color: Colors.secondary, fontFamily: 'poppins' }}>{strings.createAccountsScreen.addAccountBtn}</Text>
                    </TouchableOpacity>

                </View>

                <View>
                    <TouchableOpacity onPress={handleCreateUser} style={{ alignItems: "center", marginTop: '20%', marginBottom: '30%', backgroundColor: Colors.secondary, borderRadius: 10, marginHorizontal: 50, paddingVertical: 8 }}>
                        <Text style={{ fontFamily: 'poppins-bold', color: Colors.light }}>{strings.createAccountsScreen.startBtn}</Text>
                    </TouchableOpacity>
                </View>



                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    statusBarTranslucent={true}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{strings.createAccountsScreen.modalAddAccountTitle}</Text>
                            <View style={styles.accountInputContainer}>
                                <MaterialCommunityIcons name={selectedIcon} size={24} color={Colors.accent} style={styles.icon} />
                                <TextInput
                                    style={[styles.txtAccountInput, txtAccountEmptyLoad ? null : styles.txtAccountInputError]}
                                    onChangeText={handleChangeTxtAccount}
                                    value={txtAccount}
                                    returnKeyType='done'
                                    inputMode='text'
                                    placeholder={strings.createAccountsScreen.accountName}
                                    blurOnSubmit
                                    maxLength={18}
                                />
                            </View>
                            <Text style={styles.chooseIconText}>{strings.createAccountsScreen.chooseIconTxt}</Text>
                            <View style={styles.iconsContainer}>
                                <TouchableOpacity onPress={() => setSelectedIcon("bank")} style={[styles.iconButton, selectedIcon === "bank" && styles.selectedIconButton]}>
                                    <MaterialCommunityIcons name="bank" size={24} color={Colors.accent} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setSelectedIcon("cash")} style={[styles.iconButton, selectedIcon === "cash" && styles.selectedIconButton]}>
                                    <MaterialCommunityIcons name="cash" size={24} color={Colors.accent} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setSelectedIcon("piggy-bank")} style={[styles.iconButton, selectedIcon === "piggy-bank" && styles.selectedIconButton]}>
                                    <MaterialCommunityIcons name="piggy-bank" size={24} color={Colors.accent} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setSelectedIcon("bitcoin")} style={[styles.iconButton, selectedIcon === "bitcoin" && styles.selectedIconButton]}>
                                    <MaterialCommunityIcons name="bitcoin" size={24} color={Colors.accent} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity onPress={handleCancelButton} style={styles.cancelButton}>
                                    <Text style={styles.cancelButtonText}>{strings.createAccountsScreen.cancelBtnTxt}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleAddAccount} style={styles.createButton}>
                                    <Text style={styles.createButtonText}>{strings.createAccountsScreen.createBtnTxt}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>


            </ScrollView>
        </SafeAreaView>
    );
}

export default CreateAccountsScreen;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.light,
        paddingHorizontal: 10,
        paddingVertical: 50,
    },
    txtWelcome: {
        fontFamily: 'poppins-bold',
        color: Colors.primary,
        fontSize: 25
    },
    cardTotals: {
        flex: 1,
        marginTop: '5%',
        marginBottom: "5%",
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
    row: {
        flexDirection: 'row',
        justifyContent: "space-between"
    },
    txtAccount: {
        fontFamily: 'poppins-bold',
        color: Colors.light,
        includeFontPadding: false,
        marginLeft: 10
    },
    txtInput: {
        width: 80,
        fontFamily: 'poppins',
        includeFontPadding: false,
    },
    buttonIcon: {
        resizeMode: 'contain',
        width: 50,
        height: 50,
    },
    opacity: {
        alignItems: 'center'
    },
    txtAccountInput: {
        backgroundColor: 'white',
        height: 40,
        flex: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontFamily: 'poppins',
        fontSize: 15,
        borderWidth: 0.5,
        borderColor: Colors.secondary,
        color: Colors.primary,

    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#06002e99',
    },
    modalContent: {
        width: '90%',
        borderRadius: 10,
        overflow: 'hidden',
        borderTopRightRadius: 10,
        backgroundColor: Colors.light,
        paddingHorizontal: 20,
        paddingVertical: 25,
    },
    modalTitle: {
        fontFamily: 'poppins-bold',
        color: Colors.primary,
        textAlign: 'center',
        fontSize: 18,
    },
    accountInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 10,
    },
    icon: {
        marginRight: 20,
    },
    txtAccountInputError: {
        borderColor: 'red',
        borderWidth: 2,
    },
    chooseIconText: {
        fontFamily: 'poppins-bold',
        marginTop: 15,
    },
    iconsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    iconButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    selectedIconButton: {
        backgroundColor: Colors.primary,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 20,
    },
    cancelButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
        width: "40%",

    },
    cancelButtonText: {
        fontFamily: 'poppins',
        color: Colors.secondary,
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
        width: "40%",
    },
    createButtonText: {
        fontFamily: 'poppins-bold',
        color: Colors.light,
        textAlign: 'center',
    },

})
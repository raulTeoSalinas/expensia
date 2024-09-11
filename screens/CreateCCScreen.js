// React / React-Native
import { useState, useContext, useRef, useMemo, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView
} from "react-native";

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
import { TouchableOpacity as TouchableOpacityMod, BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';


const CreateCCScreen = ({ navigation, route }) => {

    const userName = route.params.userName;

    const language = route.params.language;

    const liquidAccounts = route.params.accounts;

    const strings = language === "en" ? en : es;

    const { createUser } = useContext(ExpensiaContext);
    const { createUserAsync } = expensiaAsyncStorage;

    const initialAccounts = [
        { id: liquidAccounts[liquidAccounts.length - 1].id + 1, name: strings.createCCScreen.bank, icon: 'credit-card-outline', amount: '', isCC: true },
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
                amount: "",
                isCC: true
            }
            setAccounts(prevAccounts => [...prevAccounts, newAccount]);
            closeModal()
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
            } else {

                amount = `-${amount}`
            }


            // Return the modified account.
            return { ...account, amount };
        });
        const allAccounts = [...liquidAccounts, ...accountsRightAmount];

        createUserAsync(userName, allAccounts, language);
        createUser(userName, allAccounts, language)

    }
    const handleCreateUserNoCC = () => {
        // Filter and modify accounts.
        const accountsRightAmount = accounts.map((account) => {
            let amount = account.amount;

            // Remove commas from the quantity.
            amount = amount.replace(/,/g, '');

            // Convert to zero if it is an empty string or a dot.
            if (amount === '' || amount === '.') {
                amount = '0';
            } else {

                amount = `-${amount}`
            }


            // Return the modified account.
            return { ...account, amount };
        });


        createUserAsync(userName, liquidAccounts, language);
        createUser(userName, liquidAccounts, language)

    }

    // Ref for Modal
    const presentRef = useRef(null);

    // Memoized snap points for Present modal
    const snapPoints = useMemo(() => ["40%"], []);

    // Function to close the Present modal.
    const closeModal = () => presentRef.current?.close();

    // Function to open the Present modal.
    const handleOpenModal = useCallback(() => {
        presentRef.current?.present();
    }, []);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.mainContainer}>


                <View style={{ flexDirection: 'row', marginHorizontal: 30, flexWrap: "wrap" }}>
                    <Text style={styles.txtWelcome}>{strings.createCCScreen.header1}</Text>
                    <GradientText style={styles.txtWelcome}>{strings.createCCScreen.header2}</GradientText>
                </View>
                <Text style={{ color: Colors.primary, fontFamily: 'Poppins-Light', fontSize: 18, textAlign: 'justify', marginTop: 7, paddingHorizontal: 30 }}>{strings.createCCScreen.registerTxt}</Text>
                <Text style={{ color: Colors.primary, fontFamily: 'Poppins-SemiBold', fontSize: 18, textAlign: 'justify', marginTop: 7, paddingHorizontal: 30 }}>{strings.createCCScreen.onlyAdd}</Text>
                <Text style={{ color: Colors.primary, fontFamily: 'Poppins-SemiBold', fontSize: 12, textAlign: 'justify', marginTop: 7, paddingHorizontal: 30 }}>{strings.createCCScreen.registerTDC}</Text>
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
                    <TouchableOpacity style={styles.opacity} onPress={() => { handleOpenModal(); setTxtAccount("") }} >
                        <Image style={styles.buttonIcon} source={require('../assets/images/icon-plus.png')} />
                        <Text style={{ color: Colors.secondary, fontFamily: 'Poppins-Light' }}>{strings.createAccountsScreen.addAccountBtn}</Text>
                    </TouchableOpacity>

                </View>

                <View>
                    <TouchableOpacity onPress={handleCreateUserNoCC} style={{ alignItems: "center", marginTop: '20%', backgroundColor: Colors.accent, borderRadius: 10, marginHorizontal: 50, paddingVertical: 8 }}>
                        <Text style={{ fontFamily: 'Poppins-SemiBold', color: Colors.light }}>{strings.createCCScreen.noCC}</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity onPress={handleCreateUser} style={{ alignItems: "center", marginTop: 32, marginBottom: '30%', backgroundColor: Colors.secondary, borderRadius: 10, marginHorizontal: 50, paddingVertical: 8 }}>
                        <Text style={{ fontFamily: 'Poppins-SemiBold', color: Colors.light }}>{strings.createCCScreen.startBtn}</Text>
                    </TouchableOpacity>
                </View>



                <BottomSheetModal
                    index={0}
                    ref={presentRef}
                    snapPoints={snapPoints}
                    handleIndicatorStyle={{ backgroundColor: "#d6d5dd" }}
                    handleComponent={() => <View style={{ justifyContent: "center", alignItems: "center" }}>
                        <View style={{ width: 40, height: 4, backgroundColor: "#d6d5dd", marginTop: 10, borderRadius: 2 }}>
                        </View>
                    </View>}
                    backgroundStyle={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#d6d5dd", borderRadius: 40 }}
                >
                    <View style={{ alignItems: "flex-end", width: "95%" }}>
                        <TouchableOpacityMod onPress={() => closeModal()} >
                            <MaterialCommunityIcons name="close" size={24} color={"#d6d5dd"} />
                        </TouchableOpacityMod>
                    </View>

                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{strings.createAccountsScreen.modalAddAccountTitle}</Text>
                        <View style={styles.accountInputContainer}>
                            <MaterialCommunityIcons name={selectedIcon} size={24} color={Colors.accent} style={styles.icon} />
                            <BottomSheetTextInput
                                style={[styles.txtAccountInput, txtAccountEmptyLoad ? null : styles.txtAccountInputError]}
                                onChangeText={handleChangeTxtAccount}
                                value={txtAccount}
                                returnKeyType='done'
                                inputMode='text'
                                placeholderTextColor="#bebebe"
                                placeholder={strings.createAccountsScreen.accountName}
                                blurOnSubmit
                                maxLength={18}
                            />
                        </View>
                        <Text style={styles.chooseIconText}>{strings.createAccountsScreen.chooseIconTxt}</Text>
                        <View style={styles.iconsContainer}>
                            <TouchableOpacityMod onPress={() => setSelectedIcon("bank")} style={[styles.iconButton, selectedIcon === "bank" && styles.selectedIconButton]}>
                                <MaterialCommunityIcons name="bank" size={24} color={Colors.accent} />
                            </TouchableOpacityMod>
                            <TouchableOpacityMod onPress={() => setSelectedIcon("cash")} style={[styles.iconButton, selectedIcon === "cash" && styles.selectedIconButton]}>
                                <MaterialCommunityIcons name="cash" size={24} color={Colors.accent} />
                            </TouchableOpacityMod>
                            <TouchableOpacityMod onPress={() => setSelectedIcon("piggy-bank")} style={[styles.iconButton, selectedIcon === "piggy-bank" && styles.selectedIconButton]}>
                                <MaterialCommunityIcons name="piggy-bank" size={24} color={Colors.accent} />
                            </TouchableOpacityMod>
                            <TouchableOpacityMod onPress={() => setSelectedIcon("bitcoin")} style={[styles.iconButton, selectedIcon === "bitcoin" && styles.selectedIconButton]}>
                                <MaterialCommunityIcons name="bitcoin" size={24} color={Colors.accent} />
                            </TouchableOpacityMod>
                            <TouchableOpacityMod onPress={() => setSelectedIcon("credit-card-outline")} style={[styles.iconButton, selectedIcon === "credit-card-outline" && styles.selectedIconButton]}>
                                <MaterialCommunityIcons name="credit-card-outline" size={24} color={Colors.accent} />
                            </TouchableOpacityMod>
                        </View>
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacityMod onPress={handleAddAccount} style={styles.createButton}>
                                <Text style={styles.createButtonText}>{strings.createAccountsScreen.createBtnTxt}</Text>
                            </TouchableOpacityMod>
                        </View>
                    </View>
                </BottomSheetModal>


            </ScrollView>
        </SafeAreaView>
    );
}

export default CreateCCScreen;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.light,
        paddingHorizontal: 10,
        paddingVertical: 50,
    },
    txtWelcome: {
        fontFamily: 'Poppins-SemiBold',
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
        fontFamily: 'Poppins-SemiBold',
        color: Colors.light,
        includeFontPadding: false,
        marginLeft: 10
    },
    txtInput: {
        width: 80,
        fontFamily: 'Poppins-Light',
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
        fontFamily: 'Poppins-Light',
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
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        borderTopRightRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 25,
    },
    modalTitle: {
        fontFamily: 'Poppins-SemiBold',
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
        fontFamily: 'Poppins-SemiBold',
        marginTop: 15,
    },
    iconsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    iconButton: {
        paddingHorizontal: 5,
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
        fontFamily: 'Poppins-Light',
        color: Colors.secondary,
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
        width: "95%",
    },
    createButtonText: {
        fontFamily: 'Poppins-SemiBold',
        color: Colors.light,
        textAlign: 'center',
    },

})
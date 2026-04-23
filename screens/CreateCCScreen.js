// React / React-Native
import { useState, useContext, useRef, useMemo, useCallback } from "react";
import {
    View,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView
} from "react-native";
import Text from '@components/Text';

// Utils
import Colors from "../constants/colors";
import { getAccountIconRows } from "../constants/accountIcons";
import { es, en } from "../utils/languages";
// Components
import GradientText from "../components/TextGradient";
// Icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
// Context
import { ExpensiaContext } from "../context/expensiaContext";
import { TouchableOpacity as TouchableOpacityMod, BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';


const CreateCCScreen = ({ navigation, route }) => {

    const userName = route.params.userName;

    const language = route.params.language;

    const liquidAccounts = route.params.accounts;

    const strings = language === "en" ? en : es;

    const { createUser, addAccount } = useContext(ExpensiaContext);

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
                id: accounts.length - 1 == -1 ? liquidAccounts[liquidAccounts.length - 1].id + 1 : accounts[accounts.length - 1].id + 1, //This its to get the nextId
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

    const handleCreateUser = async () => {
        await createUser(userName, language)
        for (const acc of liquidAccounts) {
            const amount = parseFloat(acc.amount.replace(/,/g, '')) || 0
            await addAccount(acc.name, acc.icon, !!acc.isCC, amount)
        }
        for (const account of accounts) {
            let amount = account.amount.replace(/,/g, '')
            amount = amount === '' || amount === '.' ? 0 : -parseFloat(amount)
            await addAccount(account.name, account.icon, true, amount)
        }
    }

    const handleCreateUserNoCC = async () => {
        await createUser(userName, language)
        for (const acc of liquidAccounts) {
            const amount = parseFloat(acc.amount.replace(/,/g, '')) || 0
            await addAccount(acc.name, acc.icon, !!acc.isCC, amount)
        }
    }

    // Ref for Modal
    const presentRef = useRef(null);

    // Memoized snap points for Present modal
    const snapPoints = useMemo(() => ["50%"], []);

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
                    <Text weight="bold" color="primary" style={{ fontSize: 25 }}>{strings.createCCScreen.header1}</Text>
                    <GradientText style={styles.txtWelcome}>{strings.createCCScreen.header2}</GradientText>
                </View>
                <Text color="primary" size="l" style={{ textAlign: 'justify', marginTop: 7, paddingHorizontal: 30 }}>{strings.createCCScreen.registerTxt}</Text>
                <Text weight="bold" color="primary" size="l" style={{ textAlign: 'justify', marginTop: 7, paddingHorizontal: 30 }}>{strings.createCCScreen.onlyAdd}</Text>
                <Text weight="bold" color="primary" size="s" style={{ textAlign: 'justify', marginTop: 7, paddingHorizontal: 30 }}>{strings.createCCScreen.registerTDC}</Text>
                {accounts.map((account, i) => (
                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={styles.cardTotals}>
                            <View style={styles.row}>
                                <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                    <MaterialCommunityIcons name={account.icon} size={24} color={Colors.accent} />
                                    <Text weight="bold" color="light" style={styles.txtAccount}>{account.name}</Text>
                                </View>
                                <View>
                                    <View style={{ flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 10, justifyContent: 'center', alignItems: "center", padding: 4 }}>
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
                            <MaterialCommunityIcons name="trash-can-outline" size={28} color={Colors.error} style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </View>
                ))}
                <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity style={styles.opacity} onPress={() => { handleOpenModal(); setTxtAccount("") }} >
                        <Image style={styles.buttonIcon} source={require('../assets/images/icon-plus.png')} />
                        <Text color="secondary">{strings.createAccountsScreen.addAccountBtn}</Text>
                    </TouchableOpacity>

                </View>

                <View>
                    <TouchableOpacity onPress={handleCreateUserNoCC} style={{ alignItems: "center", marginTop: '20%', backgroundColor: Colors.accent, borderRadius: 10, marginHorizontal: 50, paddingVertical: 8 }}>
                        <Text weight="bold" color="light">{strings.createCCScreen.noCC}</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity onPress={handleCreateUser} style={{ alignItems: "center", marginTop: 32, marginBottom: '30%', backgroundColor: Colors.secondary, borderRadius: 10, marginHorizontal: 50, paddingVertical: 8 }}>
                        <Text weight="bold" color="light">{strings.createCCScreen.startBtn}</Text>
                    </TouchableOpacity>
                </View>



                <BottomSheetModal
                    index={0}
                    ref={presentRef}
                    snapPoints={snapPoints}
                    enableDynamicSizing={false}
                    handleIndicatorStyle={{ backgroundColor: Colors.sheetHandle }}
                    handleComponent={() => <View style={{ justifyContent: "center", alignItems: "center" }}>
                        <View style={{ width: 40, height: 4, backgroundColor: Colors.sheetHandle, marginTop: 10, borderRadius: 2 }}>
                        </View>
                    </View>}
                    backgroundStyle={{ backgroundColor: Colors.sheetBackground, borderWidth: 1, borderColor: Colors.sheetBorder, borderRadius: 40 }}
                >
                    <View style={{ alignItems: "flex-end", width: "95%" }}>
                        <TouchableOpacityMod onPress={() => closeModal()} >
                            <MaterialCommunityIcons name="close" size={24} color={Colors.sheetHandle} />
                        </TouchableOpacityMod>
                    </View>

                    <View style={styles.modalContent}>
                        <Text weight="bold" color="primary" size="l" style={styles.modalTitle}>{strings.createAccountsScreen.modalAddAccountTitle}</Text>
                        <View style={styles.accountInputContainer}>
                            <MaterialCommunityIcons name={selectedIcon} size={24} color={Colors.accent} style={styles.icon} />
                            <BottomSheetTextInput
                                style={[styles.txtAccountInput, txtAccountEmptyLoad ? null : styles.txtAccountInputError]}
                                onChangeText={handleChangeTxtAccount}
                                value={txtAccount}
                                returnKeyType='done'
                                inputMode='text'
                                placeholderTextColor={Colors.placeholder}
                                placeholder={strings.createAccountsScreen.accountName}
                                blurOnSubmit
                                maxLength={18}
                            />
                        </View>
                        <Text style={styles.chooseIconText}>{strings.createAccountsScreen.chooseIconTxt}</Text>
                        <View style={styles.iconsContainer}>
                            {getAccountIconRows().map((row, rowIndex) => (
                                <View key={rowIndex} style={styles.iconsRow}>
                                    {row.map((iconName) => (
                                        <TouchableOpacityMod
                                            key={iconName}
                                            onPress={() => setSelectedIcon(iconName)}
                                            style={[styles.iconButton, selectedIcon === iconName && styles.selectedIconButton]}
                                        >
                                            <MaterialCommunityIcons name={iconName} size={24} color={Colors.accent} />
                                        </TouchableOpacityMod>
                                    ))}
                                </View>
                            ))}
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
        borderColor: Colors.white,
        shadowColor: Colors.shadow,
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
        backgroundColor: Colors.white,
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
        backgroundColor: Colors.overlay,
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
        textAlign: 'center',
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
        borderColor: Colors.error,
        borderWidth: 2,
    },
    chooseIconText: {
        marginTop: 15,
    },
    iconsContainer: {
        marginTop: 20,
        gap: 10,
    },
    iconsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    iconButton: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 4,
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
    createButton: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
        width: "95%",
    },
    createButtonText: {
        textAlign: 'center',
    },

})
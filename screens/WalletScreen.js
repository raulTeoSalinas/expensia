// React / React-Native
import { useState, useEffect, useContext, useRef, useMemo, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    Modal,
    Alert,
    Platform
} from "react-native";
//Icons
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
// Utils
import Colors from "../utils/colors";
import { es, en } from "../utils/languages";
// Context
import { ExpensiaContext } from "../context/expensiaContext";
// Components
import Knob from "../components/Knob";
import ModalSelect from "../components/ModalSelect";
import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";
// AsyncStorage
import expensiaAsyncStorage from "../context/expensiaAsyncStorage";
import { TouchableOpacity as TouchableOpacityMod, BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';


const WalletScreen = ({ navigation }) => {


    const { user, addOrRestAmount, editAccount, addAccount, deleteAccount } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;

    const [txtEmpyLoad, setTxtEmptyLoad] = useState(true);
    const [userAccounts, setUserAccounts] = useState([]);
    const [selectedFrom, setSelectedFrom] = useState("");
    const [selectedTo, setSelectedTo] = useState("");
    const [selectedAccount, setSelectedAccount] = useState();
    const [modalFromVisible, setModalFromVisible] = useState(false);
    const [modalToVisible, setModalToVisible] = useState(false);
    const { addOrRestAmountAsync, editAccountAsync, addAccountAsync, deleteAccountAsync } = expensiaAsyncStorage;

    useEffect(() => {
        setUserAccounts(user.accounts);

        if (user.accounts.length > 1) {
            setSelectedFrom(user.accounts[0]);
            setSelectedTo(user.accounts[1]);
        }

    }, [user])

    const [textAmount, setTextAmount] = useState('');

    const [selectedIcon, setSelectedIcon] = useState('bank');

    const [txtAccount, setTxtAccount] = useState('');

    const [isEdited, setIsEdited] = useState(false);

    const [isTranferring, setIsTransferring] = useState(false)

    const [txtAccountEmptyLoad, setTxtAccountEmptyLoad] = useState(true);

    const handleChangeTxtAccount = (inputText) => {
        setTxtAccount(inputText)
        setTxtAccountEmptyLoad(true)
    }


    const handleChangeTextAmount = (inputText) => {
        if (inputText === '') {
            setTextAmount('');
            return;
        }
        // Remover caracteres no numéricos excepto puntos decimales
        const numericValue = inputText.replace(/[^0-9.]/g, '');
        // Validar el formato del número decimal
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

        setTxtEmptyLoad(true);
        setTextAmount(formattedText);
    };


    const handleSelectedFrom = (item) => {
        setSelectedFrom(item)
    }
    const handleSelectedTo = (item) => {
        setSelectedTo(item)
    }

    const handleAddAccount = () => {
        if (txtAccount === '' || txtAccount === '.') {
            setTxtAccountEmptyLoad(false)
        } else {
            const name = txtAccount;
            const icon = selectedIcon;

            if (!isEdited) {
                addAccount(name, icon, isCC);
                addAccountAsync(name, icon, isCC);
            } else {
                const id = selectedAccount.id;
                editAccount(id, name, icon, isCC);
                editAccountAsync(id, name, icon, isCC);
            }

            closeModal()
        }
    }

    const openAddAccount = () => {
        handleOpenModal()
        setTxtAccount("");
        setIsEdited(false);
        setSelectedIcon("bank");
        setTxtAccountEmptyLoad(true)
        setIsCC(false)
    }

    const openEditAccount = (account) => {
        handleOpenModal()
        setTxtAccount(account.name);
        setIsEdited(true);
        setSelectedIcon(account.icon)
        setIsCC(account?.isCC ? true : false)
        setTxtAccountEmptyLoad(true)
        setSelectedAccount(account)
    }

    const handleTransfer = async () => {
        if (textAmount === '' || textAmount === '.') {
            setTxtEmptyLoad(false)
        } else {
            if (selectedFrom.amount < parseFloat(textAmount.replace(/,/g, ''))) {
                Alert.alert(strings.walletScreen.alertFailedTransferTitle, strings.walletScreen.alertFailedTransferDesc)
            } else {

                setIsTransferring(true);

                const typeIncome = "i";
                const typeExpense = "e";
                const amount = textAmount.replace(/,/g, '');
                const from = selectedFrom;
                const to = selectedTo;

                addOrRestAmount(amount, typeExpense, from);
                addOrRestAmount(amount, typeIncome, to);
                await addOrRestAmountAsync(amount, typeExpense, from);
                await addOrRestAmountAsync(amount, typeIncome, to);
                setTimeout(() => {
                    setIsTransferring(false); // Establecer el texto del botón en "Transferir" después de medio segundo
                }, 1500);
            }

            setTextAmount("")

        }
    }

    const handleDeleteAccount = () => {
        if (parseFloat(selectedAccount.amount) > 0) {
            Alert.alert(strings.walletScreen.alertFailedDeleAccTitle, strings.walletScreen.alertFailedDeleAccDesc)
        } else {
            const id = selectedAccount.id;
            deleteAccount(id);
            deleteAccountAsync(id);
        }
        closeModal()
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

    const [isCC, setIsCC] = useState(false);

    const changeIsCC = () => {
        setIsCC(!isCC)
    }

    return (
        <ScreenContainer>

            <Header darkText={strings.walletScreen.headerDarkTxt} gradientText={strings.walletScreen.headerGradientTxt} />

            <Text style={{ color: Colors.primary, fontFamily: 'Poppins-SemiBold', fontSize: 18, textAlign: 'justify', paddingHorizontal: 30 }}>{strings.walletScreen.title1}</Text>
            <View style={styles.cardTransfer}>

                <View style={styles.row}>
                    <Text style={styles.label}>{strings.walletScreen.amountTxt}</Text>
                    <TextInput
                        style={[styles.txtInput, txtEmpyLoad ? null : { borderColor: 'red', borderWidth: 2 }]}
                        onChangeText={handleChangeTextAmount}
                        value={textAmount}
                        keyboardType="decimal-pad"
                        returnKeyType='done'
                        placeholder="0.00"
                    />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{strings.walletScreen.fromTxt}</Text>
                    <TouchableOpacity activeOpacity={0.5} style={styles.viewFakeInput} onPress={() => setModalFromVisible(!modalFromVisible)}>
                        <Text style={styles.txtFakeInput}>{selectedFrom.name} </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{strings.walletScreen.toTxt}</Text>
                    <TouchableOpacity activeOpacity={0.5} style={styles.viewFakeInput} onPress={() => setModalToVisible(!modalToVisible)}>
                        <Text style={styles.txtFakeInput}>{selectedTo.name} </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={handleTransfer} style={styles.btnTransfer}>
                        <Text style={styles.txtTitleWhite}>{isTranferring ? strings.walletScreen.btnTransfering : strings.walletScreen.btnTransfer}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={{ color: Colors.primary, fontFamily: 'Poppins-SemiBold', fontSize: 18, textAlign: 'justify', marginTop: 25, paddingHorizontal: 30 }}>{strings.walletScreen.title2}</Text>
            {userAccounts.map((account, i) => (

                <TouchableOpacity key={i} onPress={openEditAccount.bind(null, account)} style={styles.cardTotals}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialCommunityIcons name={account.icon} size={24} color={Colors.accent} />
                            <Text style={styles.txtAccount}>{account.name}</Text>
                        </View>
                        <MaterialCommunityIcons name="lead-pencil" size={28} color={Colors.light} />
                    </View>
                </TouchableOpacity>

            ))}
            <View style={{ alignItems: 'center' }}>
                <TouchableOpacity style={styles.opacity} onPress={openAddAccount} >

                    <Image style={styles.buttonIcon} source={require('../assets/images/icon-plus.png')} />
                    <Text style={{ color: Colors.secondary, fontFamily: 'Poppins-Light' }}>{strings.walletScreen.addAccountBtn}</Text>
                </TouchableOpacity>

            </View>


            <ModalSelect
                modalVisible={modalFromVisible}
                setModalVisible={setModalFromVisible}
                data={userAccounts.filter(account => !account?.isCC)}
                selectedValue={selectedFrom}
                handleSelectedModal={handleSelectedFrom}
            />
            <ModalSelect
                modalVisible={modalToVisible}
                setModalVisible={setModalToVisible}
                data={userAccounts}
                selectedValue={selectedTo}
                handleSelectedModal={handleSelectedTo}
            />

            <BottomSheetModal
                index={0}
                ref={presentRef}
                snapPoints={snapPoints}
                handleIndicatorStyle={{ backgroundColor: "#d6d5dd" }}
                handleComponent={() =>
                    <View style={{ justifyContent: "center", alignItems: "center" }}>
                        <View style={{ width: 40, height: 4, backgroundColor: "#d6d5dd", marginTop: 10, borderRadius: 2 }}>
                        </View>
                    </View>}
                backgroundStyle={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#d6d5dd", borderRadius: 40 }}
            >
                <View style={{ justifyContent: isEdited ? "space-between" : "flex-end", width: "95%", flexDirection: "row" }}>
                    {isEdited &&
                        <TouchableOpacity style={{ marginLeft: 20 }} onPress={handleDeleteAccount}>
                            <MaterialCommunityIcons name="trash-can" color='red' size={24} />
                        </TouchableOpacity>
                    }
                    <TouchableOpacityMod onPress={() => closeModal()} >
                        <MaterialCommunityIcons name="close" size={24} color={"#d6d5dd"} />
                    </TouchableOpacityMod>
                </View>
                <View style={{ width: '100%', borderRadius: 10, overflow: "hidden", borderTopRightRadius: 10, paddingHorizontal: 20, paddingBottom: 25 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', color: Colors.primary, textAlign: 'center', fontSize: 18 }}>
                                {isEdited ? strings.walletScreen.modalEditAccountTitle : strings.walletScreen.modalAddAccountTitle}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginTop: 10 }}>
                        <MaterialCommunityIcons name={selectedIcon} size={24} color={Colors.accent} style={{ marginRight: 20 }} />
                        <BottomSheetTextInput
                            style={[styles.txtAccountInput, txtAccountEmptyLoad ? null : { borderColor: 'red', borderWidth: 2 }]}
                            onChangeText={handleChangeTxtAccount}
                            value={txtAccount}
                            returnKeyType='done'
                            inputMode='text'
                            placeholder="Ej. Banco"
                            blurOnSubmit
                            maxLength={18}
                        />

                    </View>
                    <View style={{ flexDirection: "row", marginTop: 16 }}>
                        <Text style={{ fontFamily: 'Poppins-SemiBold', marginRight: 4 }}>{strings.walletScreen.isCC}</Text>
                        <Knob isActive={isCC} onPress={changeIsCC} />

                    </View>

                    <Text style={{ fontFamily: 'Poppins-SemiBold', marginTop: 15 }}>{strings.walletScreen.chooseIconTxt}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                        <TouchableOpacity onPress={() => setSelectedIcon("bank")} style={[{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }, selectedIcon == "bank" && { backgroundColor: Colors.primary }]}>
                            <MaterialCommunityIcons name="bank" size={24} color={Colors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedIcon("cash")} style={[{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }, selectedIcon == "cash" && { backgroundColor: Colors.primary }]}>
                            <MaterialCommunityIcons name="cash" size={24} color={Colors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedIcon("piggy-bank")} style={[{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }, selectedIcon == "piggy-bank" && { backgroundColor: Colors.primary }]}>
                            <MaterialCommunityIcons name="piggy-bank" size={24} color={Colors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedIcon("bitcoin")} style={[{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }, selectedIcon == "bitcoin" && { backgroundColor: Colors.primary }]}>
                            <MaterialCommunityIcons name="bitcoin" size={24} color={Colors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacityMod onPress={() => setSelectedIcon("credit-card-outline")} style={[{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }, selectedIcon === "credit-card-outline" && { backgroundColor: Colors.primary }]}>
                            <MaterialCommunityIcons name="credit-card-outline" size={24} color={Colors.accent} />
                        </TouchableOpacityMod>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: 'space-around', alignItems: 'center', marginTop: 20 }}>
                        <TouchableOpacity onPress={handleAddAccount} style={{ backgroundColor: Colors.secondary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, width: "95%" }}>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', color: Colors.light, textAlign: 'center' }}>{isEdited ? strings.walletScreen.saveBtnTxt : strings.walletScreen.createBtnTxt}</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </BottomSheetModal>


        </ScreenContainer>
    );
}

export default WalletScreen;

const styles = StyleSheet.create({
    welcomeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: '8%',
        marginRight: '2%',
        justifyContent: 'space-between'
    },
    welcome: {
        fontSize: 25,
        marginTop: Platform.OS === 'ios' ? 20 : 40,
        fontFamily: 'Poppins-SemiBold',
        color: Colors.primary
    },
    cardTransfer: {
        backgroundColor: Colors.primary,
        marginHorizontal: '6%',
        marginTop: '2%',
        borderRadius: 10,
        paddingVertical: '8%',
        borderWidth: 1,
        borderRadius: 20,
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
    txtTitleWhite: {

        color: Colors.light,
        textAlign: 'center',
        fontFamily: 'Poppins-SemiBold',
        includeFontPadding: false
    },
    row: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8%',
        marginHorizontal: '8%'
    },
    viewFakeInput: {
        backgroundColor: 'white',
        height: 40,
        width: '70%',
        borderRadius: 10,
        paddingHorizontal: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 0.5,
        borderColor: Colors.secondary,
        includeFontPadding: false
    },
    txtFakeInput: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        color: Colors.primary

    },
    label: {
        fontFamily: 'Poppins-Light',
        color: Colors.light,
    },
    txtInput: {
        backgroundColor: 'white',
        height: 40,
        width: '70%',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontFamily: 'Poppins-Light',
        fontSize: 15,
        borderWidth: 0.5,
        borderColor: Colors.secondary,
        color: Colors.primary
    },
    btnTransfer: {
        paddingHorizontal: 20,
        paddingVertical: 4,
        backgroundColor: Colors.secondary,
        borderRadius: 10
    },
    cardTotals: {
        backgroundColor: Colors.primary,
        flex: 1,
        marginVertical: 5,
        justifyContent: 'center',
        marginHorizontal: '8%',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    txtAccount: {
        color: Colors.light,
        fontFamily: 'Poppins-Light',
        includeFontPadding: false,
        marginLeft: 10
    },
    buttonIcon: {
        resizeMode: 'contain',
        width: 50,
        height: 50,
    },
    opacity: {
        alignItems: 'center',
        marginBottom: '5%'
    },
    buttonIcon2: {
        resizeMode: 'contain',
        width: 50,
        height: 50,
    },
    opacity2: {
        width: 60,
        height: 60,
        marginTop: Platform.OS === 'ios' ? 0 : 30,
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
});
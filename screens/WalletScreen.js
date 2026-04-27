// React / React-Native
import { useState, useEffect, useContext, useRef, useMemo, useCallback } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    Modal,
    Alert,
    Platform
} from "react-native";
import Text from '@components/Text';
//Icons
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
// Utils
import Colors from "../constants/colors";
import { getAccountIconRows } from "../constants/accountIcons";
import { es, en } from "../utils/languages";
// Context
import { ExpensiaContext } from "../context/expensiaContext";
import { useAccounts } from '../hooks/queries';
// Components
import Knob from "../components/Knob";
import ModalSelect from "../components/ModalSelect";
import ModalDelete from "../components/ModalDelete";
import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";
import { TouchableOpacity as TouchableOpacityMod, BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';


const WalletScreen = ({ navigation }) => {


    const { addOrRestAmount, addTransfer, editAccount, addAccount, deleteAccount, user } = useContext(ExpensiaContext);
    const { data: accounts = [] } = useAccounts();
    const strings = user && user.language === "en" ? en : es;

    const [txtEmpyLoad, setTxtEmptyLoad] = useState(true);
    const [selectedFrom, setSelectedFrom] = useState(accounts[0] ?? "");
    const [selectedTo, setSelectedTo] = useState(accounts[1] ?? "");
    const [selectedAccount, setSelectedAccount] = useState();
    const [modalFromVisible, setModalFromVisible] = useState(false);
    const [modalToVisible, setModalToVisible] = useState(false);

    useEffect(() => {
        if (accounts.length > 1) {
            setSelectedFrom(accounts[0]);
            setSelectedTo(accounts[1]);
        }
    }, [accounts])

    const [textAmount, setTextAmount] = useState('');

    const [selectedIcon, setSelectedIcon] = useState('bank');

    const [txtAccount, setTxtAccount] = useState('');
    const [initialBalance, setInitialBalance] = useState('');

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

    const handleChangeInitialBalance = (inputText) => {
        if (inputText === '') { setInitialBalance(''); return }
        const numericValue = inputText.replace(/[^0-9.]/g, '')
        const parts = numericValue.split('.')
        if (parts.length > 2) return
        if (parts.length === 2 && parts[1].length > 2) return
        setInitialBalance(numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',').toLocaleString('en-US'))
    }

    const handleAddAccount = () => {
        if (txtAccount === '' || txtAccount === '.') {
            setTxtAccountEmptyLoad(false)
        } else {
            const name = txtAccount;
            const icon = selectedIcon;

            if (!isEdited) {
                const raw = parseFloat(initialBalance.replace(/,/g, '')) || 0
                const amount = isCC ? -Math.abs(raw) : raw
                addAccount(name, icon, isCC, amount);
            } else {
                const id = selectedAccount.id;
                editAccount(id, name, icon);
            }

            closeModal()
        }
    }

    const openAddAccount = () => {
        handleOpenModal()
        setTxtAccount("");
        setInitialBalance("");
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
        setTxtAccountEmptyLoad(true)
        setSelectedAccount(account)
    }

    const [transferConfirmVisible, setTransferConfirmVisible] = useState(false)

    const handleTransfer = () => {
        if (textAmount === '' || textAmount === '.') {
            setTxtEmptyLoad(false)
            return
        }
        if (selectedFrom.id === selectedTo.id) {
            Alert.alert(strings.walletScreen.alertSameAccountTitle, strings.walletScreen.alertSameAccountDesc)
            return
        }
        setTransferConfirmVisible(true)
    }

    const confirmTransfer = async () => {
        setTransferConfirmVisible(false)
        setIsTransferring(true)
        try {
            await addTransfer({
                fromAccountId: selectedFrom.id,
                toAccountId: selectedTo.id,
                amount: textAmount.replace(/,/g, ''),
                fromName: selectedFrom.name,
                toName: selectedTo.name,
            })
        } finally {
            setIsTransferring(false)
            setTextAmount('')
        }
    }

    const handleDeleteAccount = () => {
        const id = selectedAccount.id;
        deleteAccount(id);
        setDeleteModalVisible(false);
        closeModal();
    }


    // Ref for Modal
    const presentRef = useRef(null);

    // Memoized snap points for Present modal
    const snapPoints = useMemo(() => ["60%"], []);

    // Function to close the Present modal.
    const closeModal = () => presentRef.current?.close();

    // Function to open the Present modal.
    const handleOpenModal = useCallback(() => {
        presentRef.current?.present();
    }, []);

    const [isCC, setIsCC] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const changeIsCC = () => {
        setIsCC(!isCC)
    }

    return (
        <>
        <ScreenContainer>

            <Header darkText={strings.walletScreen.headerDarkTxt} gradientText={strings.walletScreen.headerGradientTxt} />

            <Text weight="bold" color="primary" size="l" style={{ textAlign: 'justify', paddingHorizontal: 30 }}>{strings.walletScreen.title1}</Text>
            <View style={styles.cardTransfer}>

                <View style={styles.row}>
                    <Text color="light">{strings.walletScreen.amountTxt}</Text>
                    <TextInput
                        style={[styles.txtInput, txtEmpyLoad ? null : { borderColor: Colors.error, borderWidth: 2 }]}
                        onChangeText={handleChangeTextAmount}
                        value={textAmount}
                        keyboardType="decimal-pad"
                        returnKeyType='done'
                        placeholder="0.00"
                    />
                </View>
                <View style={styles.row}>
                    <Text color="light">{strings.walletScreen.fromTxt}</Text>
                    <TouchableOpacity activeOpacity={0.5} style={styles.viewFakeInput} onPress={() => setModalFromVisible(!modalFromVisible)}>
                        <Text weight="bold" color="primary" style={styles.txtFakeInput}>{selectedFrom.name} </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <Text color="light">{strings.walletScreen.toTxt}</Text>
                    <TouchableOpacity activeOpacity={0.5} style={styles.viewFakeInput} onPress={() => setModalToVisible(!modalToVisible)}>
                        <Text weight="bold" color="primary" style={styles.txtFakeInput}>{selectedTo.name} </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={handleTransfer} style={styles.btnTransfer}>
                        <Text weight="bold" color="light" style={styles.txtTitleWhite}>{isTranferring ? strings.walletScreen.btnTransfering : strings.walletScreen.btnTransfer}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text weight="bold" color="primary" size="l" style={{ textAlign: 'justify', marginTop: 25, paddingHorizontal: 30 }}>{strings.walletScreen.title2}</Text>
            {accounts.map((account, i) => (

                <TouchableOpacity key={i} onPress={openEditAccount.bind(null, account)} style={styles.cardTotals}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialCommunityIcons name={account.icon} size={24} color={Colors.accent} />
                            <Text color="light" style={styles.txtAccount}>{account.name}</Text>
                        </View>
                        <MaterialCommunityIcons name="lead-pencil" size={28} color={Colors.light} />
                    </View>
                </TouchableOpacity>

            ))}
            <View style={{ alignItems: 'center' }}>
                <TouchableOpacity style={styles.opacity} onPress={openAddAccount} >

                    <Image style={styles.buttonIcon} source={require('../assets/images/icon-plus.png')} />
                    <Text color="secondary">{strings.walletScreen.addAccountBtn}</Text>
                </TouchableOpacity>

            </View>


            <ModalSelect
                modalVisible={modalFromVisible}
                setModalVisible={setModalFromVisible}
                data={accounts.filter(account => !account?.isCC)}
                selectedValue={selectedFrom}
                handleSelectedModal={handleSelectedFrom}
            />
            <ModalSelect
                modalVisible={modalToVisible}
                setModalVisible={setModalToVisible}
                data={accounts}
                selectedValue={selectedTo}
                handleSelectedModal={handleSelectedTo}
            />

        </ScreenContainer>

        {/* Transfer confirmation modal */}
        <Modal visible={transferConfirmVisible} transparent animationType="fade" onRequestClose={() => setTransferConfirmVisible(false)}>
            <View style={styles.confirmOverlay}>
                <View style={styles.confirmCard}>
                    <Text weight="bold" color="primary" style={styles.confirmTitle}>{strings.transferConfirm.title}</Text>
                    <Text color="primary" style={styles.confirmBody}>
                        {strings.transferConfirm.body(selectedFrom?.name ?? '', selectedTo?.name ?? '', textAmount)}
                    </Text>
                    <Text style={styles.confirmNote}>{strings.transferConfirm.note}</Text>
                    <View style={styles.confirmActions}>
                        <TouchableOpacity style={styles.confirmBtnGhost} onPress={() => setTransferConfirmVisible(false)}>
                            <Text weight="bold" color="primary">{strings.transferConfirm.cancel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmBtnPrimary} onPress={confirmTransfer}>
                            <Text weight="bold" color="light">{strings.transferConfirm.confirm}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>

        <BottomSheetModal
            index={0}
            ref={presentRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            handleIndicatorStyle={{ backgroundColor: Colors.sheetHandle }}
            handleComponent={() =>
                <View style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ width: 40, height: 4, backgroundColor: Colors.sheetHandle, marginTop: 10, borderRadius: 2 }}>
                    </View>
                </View>}
            backgroundStyle={{ backgroundColor: Colors.sheetBackground, borderWidth: 1, borderColor: Colors.sheetBorder, borderRadius: 40 }}
        >
            <View style={{ justifyContent: isEdited ? "space-between" : "flex-end", width: "95%", flexDirection: "row" }}>
                {isEdited &&
                    <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => setDeleteModalVisible(true)}>
                        <MaterialCommunityIcons name="trash-can" color={Colors.error} size={24} />
                    </TouchableOpacity>
                }
                <TouchableOpacityMod onPress={() => closeModal()} >
                    <MaterialCommunityIcons name="close" size={24} color={Colors.sheetHandle} />
                </TouchableOpacityMod>
            </View>
            <View style={{ width: '100%', borderRadius: 10, overflow: "hidden", borderTopRightRadius: 10, paddingHorizontal: 20, paddingBottom: 25 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text weight="bold" color="primary" size="l" style={{ textAlign: 'center' }}>
                            {isEdited ? strings.walletScreen.modalEditAccountTitle : strings.walletScreen.modalAddAccountTitle}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginTop: 10 }}>
                    <MaterialCommunityIcons name={selectedIcon} size={24} color={Colors.accent} style={{ marginRight: 20 }} />
                    <BottomSheetTextInput
                        style={[styles.txtAccountInput, txtAccountEmptyLoad ? null : { borderColor: Colors.error, borderWidth: 2 }]}
                        onChangeText={handleChangeTxtAccount}
                        value={txtAccount}
                        returnKeyType='done'
                        inputMode='text'
                        placeholder="Ej. Banco"
                        blurOnSubmit
                        maxLength={50}
                    />

                </View>
                {!isEdited && (
                    <>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}>
                            <Text weight="bold" style={{ marginRight: 4 }}>{strings.walletScreen.isCC}</Text>
                            <Knob isActive={isCC} onPress={changeIsCC} />
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                            <MaterialIcons name="attach-money" size={20} color={Colors.primary} />
                            <BottomSheetTextInput
                                style={styles.txtAccountInput}
                                onChangeText={handleChangeInitialBalance}
                                value={initialBalance}
                                keyboardType="decimal-pad"
                                returnKeyType="done"
                                placeholder="0.00"
                                blurOnSubmit
                            />
                        </View>
                    </>
                )}

                <Text weight="bold" style={{ marginTop: 15 }}>{strings.walletScreen.chooseIconTxt}</Text>
                <View style={styles.iconPickerGrid}>
                    {getAccountIconRows().map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.iconPickerRow}>
                            {row.map((iconName) => (
                                <TouchableOpacityMod
                                    key={iconName}
                                    onPress={() => setSelectedIcon(iconName)}
                                    style={[styles.iconPickerButton, selectedIcon === iconName && styles.iconPickerButtonSelected]}
                                >
                                    <MaterialCommunityIcons name={iconName} size={24} color={Colors.accent} />
                                </TouchableOpacityMod>
                            ))}
                        </View>
                    ))}
                </View>

                <View style={{ flexDirection: "row", justifyContent: 'space-around', alignItems: 'center', marginTop: 20 }}>
                    <TouchableOpacity onPress={handleAddAccount} style={{ backgroundColor: Colors.secondary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, width: "98%" }}>
                        <Text weight="bold" color="light" style={{ textAlign: 'center' }}>{isEdited ? strings.walletScreen.saveBtnTxt : strings.walletScreen.createBtnTxt}</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </BottomSheetModal>
        <ModalDelete
            modalVisible={deleteModalVisible}
            setModalVisible={setDeleteModalVisible}
            onPressDelete={handleDeleteAccount}
            title={strings.walletScreen.deleteAccountTitle}
            description={strings.walletScreen.deleteAccountDesc}
        />
    </>
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
    cardTransfer: {
        backgroundColor: Colors.primary,
        marginHorizontal: '6%',
        marginTop: '2%',
        borderRadius: 10,
        paddingVertical: '8%',
        borderWidth: 1,
        borderRadius: 20,
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
    txtTitleWhite: {
        textAlign: 'center',
        includeFontPadding: false
    },
    row: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8%',
        marginHorizontal: '8%'
    },
    confirmOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    confirmCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
    },
    confirmTitle: {
        fontSize: 17,
        textAlign: 'center',
        marginBottom: 12,
    },
    confirmBody: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 10,
    },
    confirmNote: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
    },
    confirmActions: {
        flexDirection: 'row',
        gap: 10,
    },
    confirmBtnGhost: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
    },
    confirmBtnPrimary: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: Colors.secondary,
    },
    viewFakeInput: {
        backgroundColor: Colors.white,
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
        fontSize: 15,
    },
    txtInput: {
        backgroundColor: Colors.white,
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
    iconPickerGrid: {
        marginTop: 20,
        gap: 10,
    },
    iconPickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    iconPickerButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 4,
        borderRadius: 10,
    },
    iconPickerButtonSelected: {
        backgroundColor: Colors.primary,
    },
});
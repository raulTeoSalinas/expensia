import { useState, useContext, useEffect } from 'react'
import {
    Keyboard,
    Pressable,
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    Alert
} from 'react-native'
import Text from '@components/Text'
import { MaterialIcons } from '@expo/vector-icons'
import { Ionicons } from '@expo/vector-icons'
import ModalSelect from '../components/ModalSelect'
import ModalSelectCategory from '../components/ModalSelectCategory'
import ModalDate from '../components/ModalDate'
import ModalDelete from '@components/ModalDelete'
import GradientText from '../components/TextGradient'
import getCurrentDate from '../utils/getCurrentDay'
import Colors from '../constants/colors'
import { es, en } from '../utils/languages'
import { ExpensiaContext } from '../context/expensiaContext'
import { useAccounts, useTransaction } from '../hooks/queries'
import Category from '../utils/category'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'

const TransactionScreen = ({ navigation, route }) => {
    const { addTransaction, editTransaction, removeTransaction, user } = useContext(ExpensiaContext)
    const { data: accounts = [] } = useAccounts()
    const idTransactionClicked = route.params?.id ?? null
    const { data: existingTx } = useTransaction(idTransactionClicked)
    const strings = user?.language === 'en' ? en : es

    const [modalDeleteTranVisible, setModalDeleteTranVisible] = useState(false)
    const [modalSelectVisible, setModalSelectVisible] = useState(false)
    const [modalSelectCategoryVisible, setModalSelectCategoryVisible] = useState(false)

    const [selectedValue, setSelectedValue] = useState(accounts[0] ?? null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [typeTrans, setTypeTrans] = useState(idTransactionClicked ? null : (route.params?.typeTrans ?? null))

    const [modalDateVisible, setModalDateVisible] = useState(false)
    const [selectedDate, setSelectedDate] = useState(getCurrentDate())
    const [txtDescription, setTxtDescription] = useState('')
    const [text, setText] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [txtEmpyLoad, setTxtEmptyLoad] = useState(true)
    const [prefilled, setPrefilled] = useState(false)

    // Set initial category when type is known (new transaction)
    useEffect(() => {
        if (!typeTrans || idTransactionClicked) return
        const cats = Category.filter(c => c.type === typeTrans)
        setSelectedCategory(cats[0] ?? null)
    }, [typeTrans])

    // Pre-fill for edit mode — runs when existingTx loads from DB
    useEffect(() => {
        if (!existingTx || prefilled) return
        setPrefilled(true)

        setTypeTrans(existingTx.type)
        setText(String(existingTx.amount))
        setSelectedDate(existingTx.date)
        setTxtDescription(existingTx.description ?? '')

        const account = accounts.find(a => a.id === existingTx.accountId)
        if (account) setSelectedValue(account)

        if (existingTx.globalCategoryId) {
            const cat = Category.find(c => c.id === existingTx.globalCategoryId)
            setSelectedCategory(cat ?? null)
        } else if (existingTx.customCategoryId) {
            setSelectedCategory({
                id: existingTx.customCategoryId,
                nameEN: existingTx.customCategoryName ?? existingTx.customCategoryId,
                nameES: existingTx.customCategoryName ?? existingTx.customCategoryId,
                type: existingTx.customCategoryType ?? existingTx.type,
                icon: existingTx.customCategoryIcon ?? 'shape'
            })
        }

    }, [existingTx, accounts])

    const handleChangeText = (inputText) => {
        if (inputText === '') { setText(''); return }
        const numericValue = inputText.replace(/[^0-9.]/g, '')
        const parts = numericValue.split('.')
        if (parts.length > 2) return
        if (parts.length === 2 && parts[1].length > 2) return
        setTxtEmptyLoad(true)
        setText(numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',').toLocaleString('en-US'))
    }

    const onPressDelete = async () => {
        await removeTransaction(idTransactionClicked)
        navigation.goBack()
    }

    const handleSaveAndGoBack = async () => {
        if (text === '' || text === '.') {
            setTxtEmptyLoad(false)
            return
        }
        const amount = text.replace(/,/g, '')
        if (parseFloat(amount) > parseFloat(selectedValue?.amount ?? 0) && typeTrans !== 'i' && !selectedValue?.isCC) {
            Alert.alert(strings.walletScreen.alertFailedTransferTitle, strings.walletScreen.alertFailedTransferDesc)
            return
        }
        setIsSaving(true)

        const isGlobalCat = selectedCategory && Category.some(c => c.id === selectedCategory.id)
        const globalCategoryId = isGlobalCat ? selectedCategory.id : null
        const customCategoryId = !isGlobalCat && selectedCategory ? selectedCategory.id : null

        try {
            if (!idTransactionClicked) {
                await addTransaction({
                    type: typeTrans,
                    amount,
                    accountId: selectedValue.id,
                    date: selectedDate,
                    globalCategoryId,
                    customCategoryId,
                    description: txtDescription
                })
            } else {
                await editTransaction(idTransactionClicked, {
                    type: typeTrans,
                    amount,
                    accountId: selectedValue.id,
                    date: selectedDate,
                    globalCategoryId,
                    customCategoryId,
                    description: txtDescription
                })
            }
            navigation.goBack()
        } finally {
            setIsSaving(false)
        }
    }

    const categoryLabel = selectedCategory
        ? (user?.language === 'en'
            ? (selectedCategory.nameEN?.length > 10 ? selectedCategory.nameEN.slice(0, 10) + '...' : selectedCategory.nameEN)
            : (selectedCategory.nameES?.length > 10 ? selectedCategory.nameES.slice(0, 10) + '...' : selectedCategory.nameES))
        : ''

    const typeLabel = typeTrans === 'i'
        ? strings.transactionScreen.headerIncome
        : typeTrans === 'e' ? strings.transactionScreen.headerExpense : ''

    return (
        <BottomSheetModalProvider>
            <SafeAreaView style={styles.mainContainer}>
                {/* Custom header — bypasses iOS 26 UIKit glass on nav bar buttons */}
                <View style={styles.customHeader}>
                    <TouchableOpacity onPress={navigation.goBack} hitSlop={12}>
                        <Ionicons name="caret-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleRow}>
                        {typeTrans ? (
                            <>
                                <Text weight="bold" color="primary" style={styles.headerTxt}>
                                    {idTransactionClicked
                                        ? strings.transactionScreen.headerEdit
                                        : strings.transactionScreen.headerRegister}
                                </Text>
                                <GradientText style={styles.headerGradientTxt}>{typeLabel}</GradientText>
                            </>
                        ) : null}
                    </View>
                    {idTransactionClicked ? (
                        <TouchableOpacity onPress={() => setModalDeleteTranVisible(true)} hitSlop={12}>
                            <Ionicons name="trash-outline" size={24} color={Colors.error} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 24 }} />
                    )}
                </View>
                <ScrollView>
                    <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
                        <View style={styles.row}>
                            <Text weight="bold" color="primary">{strings.transactionScreen.amount}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialIcons name="attach-money" size={24} color={Colors.primary} />
                                <TextInput
                                    style={[styles.txtInput, txtEmpyLoad ? null : { borderColor: Colors.error, borderWidth: 2 }]}
                                    onChangeText={handleChangeText}
                                    value={text}
                                    keyboardType="decimal-pad"
                                    returnKeyType="done"
                                />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <Text weight="bold" color="primary">{strings.transactionScreen.account}</Text>
                            <TouchableOpacity activeOpacity={0.5} style={styles.viewFakeInput} onPress={() => setModalSelectVisible(true)}>
                                <Text color="primary" style={styles.txtFakeInput}>{selectedValue?.name ?? ''}</Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.row}>
                            <Text weight="bold" color="primary">{strings.transactionScreen.date}</Text>
                            <TouchableOpacity activeOpacity={0.5} style={styles.viewFakeInput} onPress={() => setModalDateVisible(true)}>
                                <Text color="primary" style={styles.txtFakeInput}>{selectedDate}</Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.row}>
                            <Text weight="bold" color="primary">{strings.transactionScreen.category}</Text>
                            <TouchableOpacity activeOpacity={0.5} style={styles.viewFakeInput} onPress={() => setModalSelectCategoryVisible(true)}>
                                <Text color="primary" style={styles.txtFakeInput}>{categoryLabel}</Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: '8%', marginHorizontal: '9%' }}>
                            <Text weight="bold" color="primary" style={{ marginBottom: 10 }}>
                                {strings.transactionScreen.description} <Text>{strings.transactionScreen.optional}</Text>
                            </Text>
                            <TextInput
                                style={[styles.txtInput, styles.txtDescription]}
                                onChangeText={setTxtDescription}
                                multiline
                                inputMode="text"
                                blurOnSubmit
                                value={txtDescription}
                                returnKeyType="done"
                                maxLength={125}
                            />
                        </View>
                        <TouchableOpacity style={styles.touchBtn} onPress={handleSaveAndGoBack}>
                            <View style={[styles.btnContainer, isSaving && { backgroundColor: Colors.accent }]}>
                                <Text color="light" style={styles.txtBtn}>
                                    {isSaving ? strings.transactionScreen.savingTxt : strings.transactionScreen.saveBtn}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Pressable>
                    <ModalSelectCategory
                        modalVisible={modalSelectCategoryVisible}
                        setModalVisible={setModalSelectCategoryVisible}
                        selectedValue={selectedCategory}
                        handleSelectedModal={setSelectedCategory}
                    />
                    <ModalSelect
                        modalVisible={modalSelectVisible}
                        setModalVisible={setModalSelectVisible}
                        data={accounts}
                        selectedValue={selectedValue ?? {}}
                        handleSelectedModal={setSelectedValue}
                    />
                    <ModalDate
                        modalVisible={modalDateVisible}
                        setModalVisible={setModalDateVisible}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                    />
                    <ModalDelete
                        title={strings.modalDelete.titleDeleteTran}
                        description={strings.modalDelete.descriptionDeleteTran}
                        modalVisible={modalDeleteTranVisible}
                        setModalVisible={setModalDeleteTranVisible}
                        onPressDelete={onPressDelete}
                    />
                </ScrollView>
            </SafeAreaView>
        </BottomSheetModalProvider>
    )
}

export default TransactionScreen

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.light,
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderColor: Colors.sheetBorder,
    },
    headerTitleRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTxt: {
        fontSize: 20,
    },
    headerGradientTxt: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 20,
    },
    txtInput: {
        backgroundColor: Colors.white,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8%',
        marginHorizontal: '9%'
    },
    viewFakeInput: {
        backgroundColor: Colors.white,
        height: 40,
        width: 150,
        borderRadius: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        width: '82%',
        borderRadius: 10
    },
    txtBtn: {
        textAlign: 'center'
    },
    txtDescription: {
        width: '100%',
        height: 150,
        textAlignVertical: 'top',
        paddingTop: 15,
        paddingBottom: 15
    },
    touchBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '10%',
    }
})

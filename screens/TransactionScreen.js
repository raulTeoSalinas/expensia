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
import ModalDeleteTran from '../components/ModalDeleteTran'
import GradientText from '../components/TextGradient'
import HeaderTitle from '../components/HeaderTitle'
import getCurrentDate from '../utils/getCurrentDay'
import Colors from '../constants/colors'
import { es, en } from '../utils/languages'
import { ExpensiaContext } from '../context/expensiaContext'
import Category from '../utils/category'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'

const TransactionScreen = ({ navigation, route }) => {
    const { addTransaction, editTransaction, removeTransaction, transactions, accounts, user } = useContext(ExpensiaContext)
    const strings = user && user.language === 'en' ? en : es

    const idTransactionClicked = route.params?.id ?? null

    const [modalDeleteTranVisible, setModalDeleteTranVisible] = useState(false)
    const [modalSelectVisible, setModalSelectVisible] = useState(false)
    const [modalSelectCategoryVisible, setModalSelectCategoryVisible] = useState(false)

    const [selectedValue, setSelectedValue] = useState(accounts[0] ?? null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [typeTrans, setTypeTrans] = useState(null)

    const [modalDateVisible, setModalDateVisible] = useState(false)
    const [selectedDate, setSelectedDate] = useState(getCurrentDate())
    const [txtDescription, setTxtDescription] = useState('')
    const [text, setText] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [txtEmpyLoad, setTxtEmptyLoad] = useState(true)

    // Determine type from route params or existing transaction
    useEffect(() => {
        if (idTransactionClicked) {
            const tx = transactions.find(t => t.id === idTransactionClicked)
            if (tx) setTypeTrans(tx.type)
        } else {
            setTypeTrans(route.params?.typeTrans ?? null)
        }
    }, [idTransactionClicked, transactions, route.params])

    // Set initial category when type is known
    useEffect(() => {
        if (!typeTrans) return
        const label = typeTrans === 'i' ? strings.transactionScreen.headerIncome : strings.transactionScreen.headerExpense
        navigation.setOptions({ title: label })
        navigation.setOptions({
            headerTitle: ({ children }) => <HeaderTitle title={strings.transactionScreen.headerRegister} children={children} />
        })
        if (!idTransactionClicked) {
            const cats = Category.filter(c => c.type === typeTrans)
            setSelectedCategory(cats[0] ?? null)
        }
    }, [typeTrans])

    // Pre-fill for edit mode
    useEffect(() => {
        if (!idTransactionClicked) return
        const tx = transactions.find(t => t.id === idTransactionClicked)
        if (!tx) return

        setText(String(tx.amount))
        setSelectedDate(tx.date)
        setTxtDescription(tx.description ?? '')

        const account = accounts.find(a => a.id === tx.accountId)
        if (account) setSelectedValue(account)

        if (tx.globalCategoryId) {
            const cat = Category.find(c => c.id === tx.globalCategoryId)
            setSelectedCategory(cat ?? null)
        } else if (tx.customCategoryId) {
            setSelectedCategory({
                id: tx.customCategoryId,
                nameEN: tx.customCategoryName ?? tx.customCategoryId,
                nameES: tx.customCategoryName ?? tx.customCategoryId,
                type: tx.customCategoryType ?? typeTrans,
                icon: tx.customCategoryIcon ?? 'shape'
            })
        }

        navigation.setOptions({
            headerTitle: ({ children }) => (
                <>
                    <Text weight="bold" color="primary" style={{ fontSize: 20 }}>{strings.transactionScreen.headerEdit}</Text>
                    <GradientText style={{ fontFamily: 'Poppins-SemiBold', fontSize: 20 }}>{children}</GradientText>
                </>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => setModalDeleteTranVisible(true)}>
                    <Ionicons name="trash-outline" size={24} color={Colors.error} />
                </TouchableOpacity>
            ),
        })
    }, [])

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

    return (
        <BottomSheetModalProvider>
            <SafeAreaView style={styles.mainContainer}>
                <ScrollView>
                    <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
                        <View style={styles.row}>
                            <Text style={styles.label}>{strings.transactionScreen.amount}</Text>
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
                            <Text weight="bold" color="primary" size="l">{strings.transactionScreen.account}</Text>
                            <TouchableOpacity activeOpacity={0.5} style={styles.viewFakeInput} onPress={() => setModalSelectVisible(true)}>
                                <Text color="primary" style={styles.txtFakeInput}>{selectedValue?.name ?? ''}</Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.row}>
                            <Text weight="bold" color="primary" size="l">{strings.transactionScreen.date}</Text>
                            <TouchableOpacity activeOpacity={0.5} style={styles.viewFakeInput} onPress={() => setModalDateVisible(true)}>
                                <Text color="primary" style={styles.txtFakeInput}>{selectedDate}</Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.row}>
                            <Text weight="bold" color="primary" size="l">{strings.transactionScreen.category}</Text>
                            <TouchableOpacity activeOpacity={0.5} style={styles.viewFakeInput} onPress={() => setModalSelectCategoryVisible(true)}>
                                <Text color="primary" style={styles.txtFakeInput}>{categoryLabel}</Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: '8%', marginHorizontal: '9%' }}>
                            <Text weight="bold" color="primary" size="l" style={{ marginBottom: 10 }}>
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
                    <ModalDeleteTran
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
        width: 120,
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
        marginTop: '10%'
    }
})

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
import { useAccounts, useTransaction, useCustomCategories } from '../hooks/queries'
import Category from '../utils/category'
import { sortAccountsByName } from '../utils/sortAccountsByName'
import { sortCategoriesByDisplayName } from '../utils/sortCategoriesByDisplayName'

const TransactionScreen = ({ navigation, route }) => {
    const { addTransaction, editTransaction, removeTransaction, user } = useContext(ExpensiaContext)
    const { data: accounts = [] } = useAccounts()
    const { data: customCats = [] } = useCustomCategories()
    const idTransactionClicked = route.params?.id ?? null
    const { data: existingTx } = useTransaction(idTransactionClicked)
    const strings = user?.language === 'en' ? en : es

    // Route params for AI prefill
    const prefillAmount          = route.params?.prefillAmount          ?? null
    const prefillAccountId       = route.params?.prefillAccountId       ?? null
    const prefillGlobalCategoryId = route.params?.prefillGlobalCategoryId ?? null
    const prefillCustomCategoryId = route.params?.prefillCustomCategoryId ?? null
    const prefillDescription     = route.params?.prefillDescription     ?? null
    const prefillDate            = route.params?.prefillDate            ?? null
    const prefillTranscript      = route.params?.prefillTranscript      ?? null
    const isFromIA               = prefillTranscript != null
    // True for both voice (has transcript) and image/PDF (no transcript but has other prefill data)
    const hasAIPrefill           = isFromIA || prefillAmount != null || prefillGlobalCategoryId != null || prefillCustomCategoryId != null

    const [modalDeleteTranVisible, setModalDeleteTranVisible] = useState(false)
    const [modalSelectVisible, setModalSelectVisible] = useState(false)
    const [modalSelectCategoryVisible, setModalSelectCategoryVisible] = useState(false)

    const [selectedValue, setSelectedValue] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [typeTrans, setTypeTrans] = useState(idTransactionClicked ? null : (route.params?.typeTrans ?? null))

    const [modalDateVisible, setModalDateVisible] = useState(false)
    const [selectedDate, setSelectedDate] = useState(prefillDate ?? route.params?.date ?? getCurrentDate())
    const [txtDescription, setTxtDescription] = useState(prefillDescription ?? '')
    const [text, setText] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [txtEmpyLoad, setTxtEmptyLoad] = useState(true)
    const [prefilled, setPrefilled] = useState(false)

    // Default category (new transaction): first global category alphabetically (custom categories excluded from default).
    useEffect(() => {
        if (!typeTrans || idTransactionClicked) return

        if (prefillGlobalCategoryId) {
            const cat = Category.find((c) => c.id === prefillGlobalCategoryId)
            if (cat) {
                setSelectedCategory(cat)
                return
            }
        }
        if (prefillCustomCategoryId) return

        const lang = user?.language === 'en' ? 'en' : 'es'
        const globalsSorted = sortCategoriesByDisplayName(
            Category.filter((c) => c.type === typeTrans),
            lang
        )
        const firstGlobal = globalsSorted[0] ?? null

        const customForType = customCats
            .filter((c) => c.type === typeTrans)
            .map((c) => ({
                id: c.id,
                nameEN: c.name,
                nameES: c.name,
                type: c.type,
                icon: c.icon,
                isCustom: true,
            }))

        setSelectedCategory((prev) => {
            if (!prev) return firstGlobal
            const prevStillValid =
                globalsSorted.some((c) => c.id === prev.id) ||
                customForType.some((c) => c.id === prev.id)
            if (prevStillValid) return prev
            return firstGlobal
        })
    }, [typeTrans, customCats, user?.language, idTransactionClicked, prefillGlobalCategoryId, prefillCustomCategoryId])

    // AI prefill: amount and custom category (account handled in separate effect)
    useEffect(() => {
        if (!hasAIPrefill || accounts.length === 0) return
        if (prefillAmount) {
            const formatted = String(prefillAmount).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            setText(formatted)
        }
        if (prefillCustomCategoryId) {
            const cat = customCats.find(c => c.backendId === prefillCustomCategoryId)
            if (cat) setSelectedCategory({ id: cat.id, nameEN: cat.name, nameES: cat.name, type: cat.type, icon: cat.icon })
        }
    }, [accounts, customCats, hasAIPrefill])

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

    // Default account: first alphabetically; if AI prefill includes a valid account, use that.
    useEffect(() => {
        if (!accounts.length || idTransactionClicked) return

        setSelectedValue((prev) => {
            if (hasAIPrefill && prefillAccountId) {
                const prefillAcc = accounts.find((a) => a.backendId === prefillAccountId)
                if (prefillAcc) return prefillAcc
            }
            const sorted = sortAccountsByName(accounts)
            const first = sorted[0] ?? null
            if (!prev) return first
            if (!accounts.some((a) => a.id === prev.id)) return first
            return prev
        })
    }, [accounts, idTransactionClicked, hasAIPrefill, prefillAccountId])

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
        if (!selectedValue?.id) return
        const amount = text.replace(/,/g, '')
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
                {isFromIA && (
                    <View style={styles.iaBanner}>
                        <View style={styles.iaBannerHeader}>
                            <MaterialIcons name="auto-awesome" size={14} color={Colors.secondary} />
                            <Text style={styles.iaBannerLabel}>{strings.transactionScreen.iaBannerLabel}</Text>
                        </View>
                        <Text style={styles.iaBannerTranscriptLabel}>{strings.transactionScreen.iaBannerTranscript}</Text>
                        <Text style={styles.iaBannerTranscript}>{prefillTranscript}</Text>
                    </View>
                )}

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
                                <Text
                                    color="primary"
                                    style={[styles.txtFakeInput, styles.txtFakeInputEllipsis]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {selectedValue?.name ?? ''}
                                </Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} style={styles.fakeInputChevron} />
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
                        type={typeTrans}
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
    txtFakeInputEllipsis: {
        flex: 1,
        minWidth: 0,
    },
    fakeInputChevron: {
        flexShrink: 0,
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
    },
    iaBanner: {
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 4,
        padding: 12,
        borderRadius: 10,
        backgroundColor: Colors.secondary + '12',
        borderWidth: 1,
        borderColor: Colors.secondary + '44',
    },
    iaBannerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 6,
    },
    iaBannerLabel: {
        color: Colors.secondary,
        fontSize: 11,
        fontFamily: 'Poppins-SemiBold',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    iaBannerTranscriptLabel: {
        color: Colors.primary,
        fontSize: 11,
        fontFamily: 'Poppins-SemiBold',
        opacity: 0.6,
        marginBottom: 2,
    },
    iaBannerTranscript: {
        color: Colors.primary,
        fontSize: 13,
        fontFamily: 'Poppins-Light',
        fontStyle: 'italic',
        lineHeight: 18,
    },
})

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import Text from '@components/Text'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { BottomSheetModal, BottomSheetFooter, TouchableOpacity as BSTouch } from '@gorhom/bottom-sheet'
import Colors from '../constants/colors'
import Category from '../utils/category'
import ModalDate from './ModalDate'

export const DEFAULT_FILTERS = {
    type: 'all',
    categoryId: null,
    categoryIsCustom: false,
    accountId: null,
    dateFrom: null,
    dateTo: null,
    sortBy: 'date',
    sortOrder: 'DESC',
}

export function countActiveFilters(filters) {
    let n = 0
    if (filters.type !== 'all') n++
    if (filters.categoryId != null) n++
    if (filters.accountId != null) n++
    if (filters.dateFrom != null || filters.dateTo != null) n++
    if (filters.sortBy !== 'date' || filters.sortOrder !== 'DESC') n++
    return n
}

export default function FilterSheet({ visible, onClose, filters, onApply, customCats = [], accounts = [], strings, language = 'es' }) {
    const sheetRef = useRef(null)
    const snapPoints = useMemo(() => ['88%'], [])

    const [draft, setDraft] = useState(DEFAULT_FILTERS)
    const [dateFromVisible, setDateFromVisible] = useState(false)
    const [dateToVisible, setDateToVisible] = useState(false)

    useEffect(() => {
        if (visible) {
            setDraft(filters)
            sheetRef.current?.present()
        } else {
            sheetRef.current?.close()
        }
    }, [visible])

    const set = (key, value) => setDraft(d => {
        const next = { ...d, [key]: value }
        if (key === 'type' && next.categoryId != null) {
            const allCats = [
                ...Category.map(c => ({ id: c.id, type: c.type, isCustom: false })),
                ...customCats.map(c => ({ id: c.id, type: c.type, isCustom: true })),
            ]
            const selected = allCats.find(c => c.id === next.categoryId && c.isCustom === next.categoryIsCustom)
            if (selected && value !== 'all' && selected.type !== value) {
                next.categoryId = null
                next.categoryIsCustom = false
            }
        }
        return next
    })

    const handleApply = () => { onApply(draft); onClose() }
    const handleReset = () => { onApply(DEFAULT_FILTERS); onClose() }

    const renderFooter = useCallback((props) => (
        <BottomSheetFooter {...props}>
            <View style={[styles.btnRow, { paddingBottom: 24 }]}>
                <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                    <Text weight="bold" color="primary">{strings.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnApply} onPress={handleApply}>
                    <Text weight="bold" color="light">{strings.apply}</Text>
                </TouchableOpacity>
            </View>
        </BottomSheetFooter>
    ), [draft, strings])

    const allCategories = [
        ...Category.map(c => ({ id: c.id, label: language === 'en' ? c.nameEN : c.nameES, icon: c.icon, type: c.type, isCustom: false })),
        ...customCats.map(c => ({ id: c.id, label: c.name, icon: c.icon, type: c.type, isCustom: true })),
    ].filter(c => draft.type === 'all' || c.type === draft.type)

    const today = new Date().toISOString().split('T')[0]

    return (
        <>
            <BottomSheetModal
                ref={sheetRef}
                index={0}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                enableDismissOnClose
                onDismiss={onClose}
                handleIndicatorStyle={{ backgroundColor: Colors.sheetHandle }}
                handleComponent={() => (
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 40, height: 4, backgroundColor: Colors.sheetHandle, marginTop: 10, borderRadius: 2 }} />
                    </View>
                )}
                backgroundStyle={styles.sheetBg}
                footerComponent={renderFooter}
            >
                <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <BSTouch onPress={handleReset}>
                            <MaterialCommunityIcons
                                name="refresh"
                                size={24}
                                color={countActiveFilters(draft) > 0 ? Colors.primary : Colors.sheetHandle}
                            />
                        </BSTouch>
                        <Text weight="bold" color="primary" style={styles.title}>{strings.title}</Text>
                        <BSTouch onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={24} color={Colors.sheetHandle} />
                        </BSTouch>
                    </View>

                    {/* Tipo */}
                    <Text weight="bold" color="primary" style={styles.label}>{strings.type}</Text>
                    <View style={styles.pillRow}>
                        {[['all', strings.all], ['i', strings.income], ['e', strings.expenses]].map(([val, label]) => (
                            <TouchableOpacity
                                key={val}
                                style={[styles.pill, draft.type === val && styles.pillActive]}
                                onPress={() => set('type', val)}
                            >
                                <Text weight="bold" color={draft.type === val ? 'light' : 'primary'}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Cuenta */}
                    {accounts.length > 0 && <>
                        <Text weight="bold" color="primary" style={styles.label}>{strings.account}</Text>
                        <View style={styles.catWrap}>
                            <TouchableOpacity
                                style={[styles.catChip, !draft.accountId && styles.catChipActive]}
                                onPress={() => set('accountId', null)}
                            >
                                <Text weight="bold" color={!draft.accountId ? 'light' : 'primary'} style={styles.catLabel}>{strings.all}</Text>
                            </TouchableOpacity>
                            {accounts.map(acc => {
                                const isSelected = draft.accountId === acc.id
                                return (
                                    <TouchableOpacity
                                        key={acc.id}
                                        style={[styles.catChip, isSelected && styles.catChipActive]}
                                        onPress={() => set('accountId', acc.id)}
                                    >
                                        <MaterialCommunityIcons
                                            name={acc.icon}
                                            size={13}
                                            color={isSelected ? Colors.white : Colors.primary}
                                            style={{ marginRight: 4 }}
                                        />
                                        <Text weight="bold" color={isSelected ? 'light' : 'primary'} style={styles.catLabel}>
                                            {acc.name}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </>}

                    {/* Categoría */}
                    <Text weight="bold" color="primary" style={styles.label}>{strings.category}</Text>
                    <View style={styles.catWrap}>
                        <TouchableOpacity
                            style={[styles.catChip, !draft.categoryId && styles.catChipActive]}
                            onPress={() => { set('categoryId', null); set('categoryIsCustom', false) }}
                        >
                            <Text weight="bold" color={!draft.categoryId ? 'light' : 'primary'} style={styles.catLabel}>{strings.all}</Text>
                        </TouchableOpacity>
                        {allCategories.map(cat => {
                            const isSelected = draft.categoryId === cat.id && draft.categoryIsCustom === cat.isCustom
                            return (
                                <TouchableOpacity
                                    key={`${cat.isCustom ? 'c' : 'g'}-${cat.id}`}
                                    style={[styles.catChip, isSelected && styles.catChipActive]}
                                    onPress={() => { set('categoryId', cat.id); set('categoryIsCustom', cat.isCustom) }}
                                >
                                    <MaterialCommunityIcons
                                        name={cat.icon}
                                        size={13}
                                        color={isSelected ? Colors.white : Colors.primary}
                                        style={{ marginRight: 4 }}
                                    />
                                    <Text weight="bold" color={isSelected ? 'light' : 'primary'} style={styles.catLabel}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    {/* Rango de fechas */}
                    <View style={styles.labelRow}>
                        <Text weight="bold" color="primary" style={styles.label}>{strings.dateRange}</Text>
                        {(draft.dateFrom || draft.dateTo) && (
                            <TouchableOpacity onPress={() => { set('dateFrom', null); set('dateTo', null) }}>
                                <MaterialCommunityIcons name="close-circle" size={18} color={Colors.sheetHandle} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.dateRow}>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setDateFromVisible(true)}>
                            <MaterialCommunityIcons name="calendar-start" size={16} color={Colors.secondary} />
                            <Text color="primary" style={styles.dateTxt}>{draft.dateFrom ?? strings.dateFrom}</Text>
                        </TouchableOpacity>
                        <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.sheetHandle} style={{ marginHorizontal: 8 }} />
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setDateToVisible(true)}>
                            <MaterialCommunityIcons name="calendar-end" size={16} color={Colors.secondary} />
                            <Text color="primary" style={styles.dateTxt}>{draft.dateTo ?? strings.dateTo}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Ordenar */}
                    <Text weight="bold" color="primary" style={styles.label}>{strings.sortBy}</Text>
                    <View style={styles.pillRow}>
                        {[['date', strings.sortDate], ['amount', strings.sortAmount]].map(([val, label]) => (
                            <TouchableOpacity
                                key={val}
                                style={[styles.pill, draft.sortBy === val && styles.pillActive]}
                                onPress={() => set('sortBy', val)}
                            >
                                <Text weight="bold" color={draft.sortBy === val ? 'light' : 'primary'}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[styles.pill, styles.pillDir]}
                            onPress={() => set('sortOrder', draft.sortOrder === 'DESC' ? 'ASC' : 'DESC')}
                        >
                            <MaterialCommunityIcons
                                name={draft.sortOrder === 'DESC' ? 'sort-descending' : 'sort-ascending'}
                                size={15}
                                color={Colors.primary}
                                style={{ marginRight: 4 }}
                            />
                            <Text weight="bold" color="primary">
                                {draft.sortOrder === 'DESC' ? strings.sortDesc : strings.sortAsc}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </BottomSheetModal>

            <ModalDate
                modalVisible={dateFromVisible}
                setModalVisible={setDateFromVisible}
                selectedDate={draft.dateFrom ?? today}
                setSelectedDate={(d) => set('dateFrom', d)}
            />
            <ModalDate
                modalVisible={dateToVisible}
                setModalVisible={setDateToVisible}
                selectedDate={draft.dateTo ?? today}
                setSelectedDate={(d) => set('dateTo', d)}
            />
        </>
    )
}

const styles = StyleSheet.create({
    sheetBg: {
        backgroundColor: Colors.sheetBackground,
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
        borderRadius: 40,
    },
    container: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 8,
    },
    title: {
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
    },
    label: {
        marginTop: 20,
        marginBottom: 10,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 10,
    },
    pillRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
        backgroundColor: Colors.white,
    },
    pillActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    pillDir: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    catWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    catChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
        backgroundColor: Colors.white,
    },
    catChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    catLabel: {
        fontSize: 13,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
        backgroundColor: Colors.white,
    },
    dateTxt: {
        fontSize: 13,
    },
    btnRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: Colors.sheetBackground,
        borderTopWidth: 1,
        borderTopColor: Colors.sheetBorder,
    },
    btnCancel: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
        backgroundColor: Colors.white,
    },
    btnApply: {
        flex: 1.5,
        paddingVertical: 11,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: Colors.secondary,
    },
})

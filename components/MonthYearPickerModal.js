import { useEffect, useState, useRef, useMemo, useContext } from 'react'
import { Modal, View, FlatList, StyleSheet, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import Text from '@components/Text'
import Colors from '../constants/colors'
import { es, en } from '../utils/languages'
import { ExpensiaContext } from '../context/expensiaContext'

const ITEM_HEIGHT = 44
const VISIBLE_ITEMS = 5
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS
const YEAR_MIN = 1955
const YEAR_MAX = 2050

function WheelColumn({ data, selectedIndex, onSelect, renderLabel }) {
    const listRef = useRef(null)

    useEffect(() => {
        const id = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                listRef.current?.scrollToOffset({
                    offset: selectedIndex * ITEM_HEIGHT,
                    animated: false,
                })
            })
        })
        return () => cancelAnimationFrame(id)
    }, [selectedIndex])

    const getItemLayout = (_, index) => ({
        length: ITEM_HEIGHT,
        offset: index * ITEM_HEIGHT,
        index,
    })

    const handleScrollEnd = (e) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT)
        onSelect(Math.max(0, Math.min(data.length - 1, index)))
    }

    const renderItem = ({ item, index }) => {
        const dist = Math.abs(index - selectedIndex)
        const opacity = dist === 0 ? 1 : dist === 1 ? 0.45 : 0.18
        const fontSize = dist === 0 ? 17 : dist === 1 ? 15 : 13
        return (
            <View style={styles.item}>
                <Text
                    weight={dist === 0 ? 'bold' : 'regular'}
                    color="primary"
                    style={{ opacity, fontSize }}
                    numberOfLines={1}
                >
                    {renderLabel(item)}
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.column}>
            <FlatList
                ref={listRef}
                data={data}
                keyExtractor={(_, i) => String(i)}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleScrollEnd}
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                style={{ height: PICKER_HEIGHT }}
                extraData={selectedIndex}
                nestedScrollEnabled
            />
            {/* Selection band */}
            <View style={styles.selectionBand} pointerEvents="none" />
        </View>
    )
}

const MonthYearPickerModal = ({
    visible,
    onRequestClose,
    onConfirm,
    monthNames,
    initialYear,
    initialMonth,
}) => {
    const { user } = useContext(ExpensiaContext)
    const strings = user?.language === 'en' ? en : es
    const { title, confirm: confirmLabel, cancel: cancelLabel } = strings.monthYearPicker

    const [selMonth, setSelMonth] = useState(initialMonth)
    const [selYear, setSelYear] = useState(initialYear)

    useEffect(() => {
        if (visible) {
            setSelMonth(initialMonth)
            setSelYear(initialYear)
        }
    }, [visible, initialMonth, initialYear])

    const years = useMemo(() => {
        const list = []
        for (let y = YEAR_MIN; y <= YEAR_MAX; y++) list.push(y)
        return list
    }, [])

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onRequestClose}
        >
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={onRequestClose}>
                    <View style={StyleSheet.absoluteFillObject} />
                </TouchableWithoutFeedback>
                <View style={styles.sheet}>
                    <Text weight="bold" color="primary" size="l" style={styles.title}>
                        {title}
                    </Text>

                    <View style={styles.columns}>
                        <WheelColumn
                            data={monthNames}
                            selectedIndex={selMonth - 1}
                            onSelect={(i) => setSelMonth(i + 1)}
                            renderLabel={(name) => name}
                        />
                        <WheelColumn
                            data={years}
                            selectedIndex={selYear - YEAR_MIN}
                            onSelect={(i) => setSelYear(years[i])}
                            renderLabel={(y) => String(y)}
                        />
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.btn, styles.btnGhost]}
                            onPress={onRequestClose}
                            activeOpacity={0.7}
                        >
                            <Text weight="bold" color="primary">{cancelLabel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btn, styles.btnPrimary]}
                            onPress={() => onConfirm({ month: selMonth, year: selYear })}
                            activeOpacity={0.7}
                        >
                            <Text weight="bold" color="light">{confirmLabel}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default MonthYearPickerModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    sheet: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
    },
    title: {
        textAlign: 'center',
        marginBottom: 12,
    },
    columns: {
        flexDirection: 'row',
        gap: 8,
    },
    column: {
        flex: 1,
        position: 'relative',
    },
    item: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectionBand: {
        position: 'absolute',
        left: 8,
        right: 8,
        top: ITEM_HEIGHT * 2,
        height: ITEM_HEIGHT,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 2,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 12,
    },
    btn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnGhost: {
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
    },
    btnPrimary: {
        backgroundColor: Colors.secondary,
    },
})

// React / React-Native
import { useEffect, useState, useRef, useMemo, useContext } from "react";
import {
    Modal,
    View,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    ScrollView,
} from "react-native";
import Text from "@components/Text";
import Colors from "../constants/colors";
import { es, en } from "../utils/languages";
import { ExpensiaContext } from "../context/expensiaContext";

const YEAR_MIN = 1955;
const YEAR_MAX = 2050;
/** Altura de cada fila (cell + marginBottom); debe coincidir con estilos */
const PICKER_ITEM_STRIDE = 52;
const PICKER_VIEWPORT_HEIGHT = 260;

/**
 * Selector modal de mes y año (listas desplazables).
 * @param {object} props
 * @param {boolean} props.visible
 * @param {() => void} props.onRequestClose
 * @param {{ month: number, year: number }} props.onConfirm — month 1–12
 * @param {string[]} props.monthNames — 12 nombres, índice 0 = enero
 * @param {number} props.initialYear
 * @param {number} props.initialMonth — 1–12
 */
const MonthYearPickerModal = ({
    visible,
    onRequestClose,
    onConfirm,
    monthNames,
    initialYear,
    initialMonth,
}) => {
    const { user } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;
    const { title, confirm: confirmLabel, cancel: cancelLabel } = strings.monthYearPicker;
    const [selMonth, setSelMonth] = useState(initialMonth);
    const [selYear, setSelYear] = useState(initialYear);
    const monthScrollRef = useRef(null);
    const yearScrollRef = useRef(null);

    useEffect(() => {
        if (visible) {
            setSelMonth(initialMonth);
            setSelYear(initialYear);
        }
    }, [visible, initialMonth, initialYear]);

    const years = useMemo(() => {
        const list = [];
        for (let y = YEAR_MIN; y <= YEAR_MAX; y += 1) {
            list.push(y);
        }
        return list;
    }, []);

    useEffect(() => {
        if (!visible) {
            return;
        }
        const id = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const centerOffset = PICKER_VIEWPORT_HEIGHT / 2 - PICKER_ITEM_STRIDE / 2;
                const monthIndex = Math.max(0, Math.min(11, selMonth - 1));
                const monthY = Math.max(0, monthIndex * PICKER_ITEM_STRIDE - centerOffset);
                monthScrollRef.current?.scrollTo({ y: monthY, animated: false });

                const yearIndex = Math.max(0, Math.min(years.length - 1, selYear - YEAR_MIN));
                const yearY = Math.max(0, yearIndex * PICKER_ITEM_STRIDE - centerOffset);
                yearScrollRef.current?.scrollTo({ y: yearY, animated: false });
            });
        });
        return () => cancelAnimationFrame(id);
    }, [visible, selMonth, selYear, years]);

    const handleConfirm = () => {
        onConfirm({ month: selMonth, year: selYear });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onRequestClose}
        >
            <Pressable style={styles.overlay} onPress={onRequestClose}>
                <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
                    <Text weight="bold" color="primary" size="l" style={styles.title}>
                        {title}
                    </Text>
                    <View style={styles.columns}>
                        <ScrollView
                            ref={monthScrollRef}
                            style={styles.scroll}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                        >
                            {monthNames.map((name, i) => {
                                const m = i + 1;
                                const active = selMonth === m;
                                return (
                                    <TouchableOpacity
                                        key={m}
                                        style={[styles.cell, active && styles.cellActive]}
                                        onPress={() => setSelMonth(m)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            weight="bold"
                                            color={active ? "light" : "primary"}
                                            style={styles.cellText}
                                            numberOfLines={1}
                                        >
                                            {name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                        <ScrollView
                            ref={yearScrollRef}
                            style={styles.scroll}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                        >
                            {years.map((y) => {
                                const active = selYear === y;
                                return (
                                    <TouchableOpacity
                                        key={y}
                                        style={[styles.cell, active && styles.cellActive]}
                                        onPress={() => setSelYear(y)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            weight="bold"
                                            color={active ? "light" : "primary"}
                                            style={styles.cellText}
                                        >
                                            {String(y)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.btn, styles.btnGhost]}
                            onPress={onRequestClose}
                            activeOpacity={0.7}
                        >
                            <Text weight="bold" color="primary">
                                {cancelLabel}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btn, styles.btnPrimary]}
                            onPress={handleConfirm}
                            activeOpacity={0.7}
                        >
                            <Text weight="bold" color="light">
                                {confirmLabel}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default MonthYearPickerModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: "center",
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
        textAlign: "center",
        marginBottom: 12,
    },
    columns: {
        flexDirection: "row",
        gap: 12,
        maxHeight: PICKER_VIEWPORT_HEIGHT,
    },
    scroll: {
        flex: 1,
    },
    cell: {
        minHeight: 48,
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        marginBottom: 4,
    },
    cellActive: {
        backgroundColor: Colors.primary,
    },
    cellText: {
        textAlign: "center",
        fontSize: 15,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        gap: 12,
    },
    btn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    btnGhost: {
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
    },
    btnPrimary: {
        backgroundColor: Colors.secondary,
    },
});

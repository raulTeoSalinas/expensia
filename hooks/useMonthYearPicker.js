import { useState, useCallback } from "react";

/**
 * Estado y acciones compartidas para MonthYearPickerModal + Calendar (remount).
 * @param {object} options
 * @param {() => { year: number, month: number }} options.getInitialAnchor — month 1–12
 * @param {(p: { year: number, month: number }) => void} options.onConfirm — lógica específica (mes en pantalla, fecha, etc.)
 */
export function useMonthYearPicker({ getInitialAnchor, onConfirm }) {
    const [monthPickerVisible, setMonthPickerVisible] = useState(false);
    const [calendarRemountKey, setCalendarRemountKey] = useState(0);
    const [pickerAnchor, setPickerAnchor] = useState(() => getInitialAnchor());

    const openMonthYearPicker = useCallback((monthXDate) => {
        setPickerAnchor({
            year: monthXDate.getFullYear(),
            month: monthXDate.getMonth() + 1,
        });
        setMonthPickerVisible(true);
    }, []);

    const confirmMonthYear = useCallback(
        ({ year, month }) => {
            onConfirm({ year, month });
            setCalendarRemountKey((k) => k + 1);
            setMonthPickerVisible(false);
        },
        [onConfirm]
    );

    const closeMonthPicker = useCallback(() => {
        setMonthPickerVisible(false);
    }, []);

    return {
        monthPickerVisible,
        calendarRemountKey,
        pickerAnchor,
        openMonthYearPicker,
        confirmMonthYear,
        closeMonthPicker,
    };
}

// React / React-Native
import { useState, useContext, useRef, useMemo, useCallback, useEffect } from "react";
import {
    Modal,
    View,
    TouchableOpacity,
    StyleSheet
} from "react-native";
// Utils
import Colors from "../constants/colors";
import { calendarEN, calendarES, theme } from "../utils/calendarSettings";
import { es, en } from "../utils/languages";
// Third Party Libraries
import { Calendar, LocaleConfig } from 'react-native-calendars';
// Context
import { ExpensiaContext } from "../context/expensiaContext";
import { TouchableOpacity as TouchableOpacityMod, BottomSheetModal } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ModalDate = ({ modalVisible, setModalVisible, selectedDate, setSelectedDate }) => {

    const { user } = useContext(ExpensiaContext);
    const languageCalendar = user && user.language === "en" ? calendarEN : calendarES;
    const strings = user && user.language === "en" ? en : es;
    //Boolean State, used as a Key for Calendar Component. It helps to re-render Calendar component every time user change language.
    const [reRender, setReRender] = useState(false);

    useEffect(() => {
        LocaleConfig.locales["default"] = languageCalendar;
        LocaleConfig.defaultLocale = 'default';
        setReRender(!reRender) //We change the boolean state to re-render Calendar component.
    }, [user])

    useEffect(() => {
        if (modalVisible) {
            handleOpenModal()
        } else {
            closeModal()
        }
    }, [modalVisible])

    // Ref for Modal
    const presentRef = useRef(null);

    // Memoized snap points for Present modal
    const snapPoints = useMemo(() => ["30%", "60%", "90%"], []);

    // Function to close the Present modal.
    const closeModal = () => presentRef.current?.close();

    // Function to open the Present modal.
    const handleOpenModal = useCallback(() => {
        presentRef.current?.present();
    }, []);

    return (
        <BottomSheetModal
            index={1}
            ref={presentRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enableDismissOnClose
            onDismiss={() => setModalVisible(false)}
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

            <View style={styles.mainContainer}>
                <Calendar
                    key={reRender}
                    onDayPress={day => {
                        setSelectedDate(day.dateString);
                        setModalVisible(!setModalVisible)
                    }}
                    markedDates={{
                        [selectedDate]: { selected: true }
                    }}
                    theme={theme}
                />
            </View>




        </BottomSheetModal>
    )

}
export default ModalDate;

const styles = StyleSheet.create({
    mainContainer: {
        width: '100%',
        borderTopLeftRadius: 10,
        overflow: "hidden",
        borderTopRightRadius: 10,
        marginTop: 24
    }
});
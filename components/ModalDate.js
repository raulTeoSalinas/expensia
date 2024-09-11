// React / React-Native
import { useState, useEffect, useContext } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet
}
    from "react-native";
// Utils
import Colors from "../utils/colors";
import { calendarEN, calendarES, theme } from "../utils/calendarSettings";
import { es, en } from "../utils/languages";
// Third Party Libraries
import { Calendar, LocaleConfig } from 'react-native-calendars';
// Context
import { ExpensiaContext } from "../context/expensiaContext";


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

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            statusBarTranslucent={true}
            onRequestClose={() => {

                setModalVisible(!modalVisible);

            }}>
            <View style={styles.background} >

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

                    <TouchableOpacity activeOpacity={0.8} onPress={() => setModalVisible(!modalVisible)}>
                        <View style={styles.btnContainer}>
                            <Text style={styles.txtBtn}>{strings.modalSelect.btnAccept}</Text>
                        </View>
                    </TouchableOpacity>
                </View>



            </View>

        </Modal>
    )

}
export default ModalDate;

const styles = StyleSheet.create({
    btnContainer: {
        backgroundColor: Colors.secondary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,

    },
    txtBtn: {
        fontFamily: 'Poppins-Light',
        color: Colors.light,
        textAlign: 'center'
    },
    background: {
        backgroundColor: '#06002e99',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainContainer: {
        width: '90%',
        borderTopLeftRadius: 10,
        overflow: "hidden",
        borderTopRightRadius: 10
    }
});
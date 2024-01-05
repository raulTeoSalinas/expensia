// React / React-Native
import { useContext } from "react";
import {
    Modal,
    Text,
    TouchableOpacity,
    StyleSheet,
    View
} from "react-native";
// Utils
import Colors from "../utils/colors";
import { es, en } from "../utils/languages";
// Context
import { ExpensiaContext } from "../context/expensiaContext";

const ModalSettingsBtns = ({ setModalVisible, modalVisible, children, warning, title, actionAccept }) => {

    const { user} = useContext(ExpensiaContext);

    const strings = user && user.language === "en" ? en : es;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            statusBarTranslucent={true}
            onRequestClose={() => {

                setModalVisible(!modalVisible);
            }}>

            <View style={styles.background}>
                <View style={styles.mainContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {children}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.opacities} onPress={() => setModalVisible(!modalVisible)}>
                            <Text style={styles.txtCancel}>{strings.settingsScreen.cancelBtn}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={actionAccept} style={styles.opacities}>
                            <View style={[styles.btnAccept, warning && {backgroundColor: 'red'}]}>
                                <Text style={styles.txtAccept}>{warning ? strings.settingsScreen.deleteBtn : strings.settingsScreen.acceptBtn}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        </Modal>
    );
}

export default ModalSettingsBtns;

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#06002e99'
    },
    mainContainer: {
        width: '90%',
        borderRadius: 10,
        backgroundColor: Colors.light,
        paddingHorizontal: '5%',
        paddingVertical: '5%'
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: '8%'
    },
    txtCancel: {
        fontFamily: 'poppins',
        color: Colors.secondary,
        includeFontPadding: false
    },
    txtAccept: {
        fontFamily: 'poppins-bold',
        color: Colors.light,
        includeFontPadding: false
    },
    opacities: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnAccept: {
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 5
    },
    title: {
        fontFamily: 'poppins-bold',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: '8%'
    }
});
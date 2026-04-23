// React / React-Native
import { useContext } from "react";
import {
    Modal,
    TouchableOpacity,
    StyleSheet,
    View
} from "react-native";
import Text from '@components/Text';
// Utils
import Colors from "../constants/colors";
import { es, en } from "../utils/languages";
// Context
import { ExpensiaContext } from "../context/expensiaContext";

const ModalSettingsBtns = ({ setModalVisible, modalVisible, children, warning, title, actionAccept }) => {

    const { user } = useContext(ExpensiaContext);

    const strings = user && user.language === "en" ? en : es;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            statusBarTranslucent={true}
            onRequestClose={() => {

                setModalVisible(!modalVisible);
            }}>

            <View style={styles.background}>
                <View style={styles.mainContainer}>
                    <Text weight="bold" size="l" style={styles.title}>{title}</Text>
                    {children}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.opacities} onPress={() => setModalVisible(!modalVisible)}>
                            <Text style={styles.txtCancel}>{strings.settingsScreen.cancelBtn}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={actionAccept} style={styles.opacities}>
                            <View style={[styles.btnAccept, warning && { backgroundColor: Colors.error }]}>
                                <Text weight="bold" color="light" style={styles.txtAccept}>{warning ? strings.settingsScreen.deleteBtn : strings.settingsScreen.acceptBtn}</Text>
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
        backgroundColor: Colors.overlay
    },
    mainContainer: {
        width: '90%',
        borderRadius: 10,
        backgroundColor: Colors.light,
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        borderBottomWidth: 20,
        borderColor: Colors.secondary
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
        marginTop: '8%'
    },
    txtCancel: {
        includeFontPadding: false
    },
    txtAccept: {
        includeFontPadding: false
    },
    opacities: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    btnAccept: {
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 8,
        width: '100%',
    },
    title: {
        textAlign: 'center',
        marginBottom: '8%'
    }
});
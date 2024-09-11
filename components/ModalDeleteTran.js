// React / React-Native
import {
    StyleSheet,
    Modal,
    TouchableOpacity,
    View,
    Text
} from "react-native";
// Utils
import Colors from "../utils/colors";
// Navigation
import { useNavigation } from "@react-navigation/native";

const ModalDeleteTran = ({ modalVisible, setModalVisible, onPressDelete }) => {

    const handleCancelButton = () => {
        setModalVisible(!modalVisible)
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            statusBarTranslucent={true}
            onRequestClose={() => {

                setModalVisible(!modalVisible);
            }}>


            <View style={styles.container}>
                <View style={styles.modalContent}>
                    <Text style={styles.headerText}>¿Estás seguro de borrar la transacción?</Text>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity onPress={handleCancelButton} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onPressDelete} style={styles.deleteButton}>
                            <Text style={styles.deleteButtonText}>Borrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
export default ModalDeleteTran;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#06002e99',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '90%',
        borderRadius: 10,
        overflow: "hidden",
        borderTopRightRadius: 10,
        backgroundColor: Colors.light,
        paddingHorizontal: 10,
        paddingVertical: 25
    },
    headerText: {
        fontFamily: 'Poppins-SemiBold',
        color: Colors.primary,
        textAlign: 'center'
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 20
    },
    cancelButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
        width: 110
    },
    cancelButtonText: {
        fontFamily: 'Poppins-Light',
        color: Colors.accent,
        textAlign: 'center'
    },
    deleteButton: {
        backgroundColor: Colors.accent,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
        width: 110,
    },
    deleteButtonText: {
        fontFamily: 'Poppins-SemiBold',
        color: Colors.light,
        textAlign: 'center'
    }
});
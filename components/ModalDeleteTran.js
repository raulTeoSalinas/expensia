// React / React-Native
import {
    StyleSheet,
    Modal,
    TouchableOpacity,
    View,
} from "react-native";
import Text from '@components/Text';
// Utils
import Colors from "../constants/colors";
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
                    <Text weight="bold" color="primary" style={styles.headerText}>¿Estás seguro de borrar la transacción?</Text>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity onPress={handleCancelButton} style={styles.cancelButton}>
                            <Text color="accent" style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onPressDelete} style={styles.deleteButton}>
                            <Text weight="bold" color="light" style={styles.deleteButtonText}>Borrar</Text>
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
        backgroundColor: Colors.overlay,
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
        textAlign: 'center'
    }
});
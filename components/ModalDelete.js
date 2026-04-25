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
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@hooks/useTranslation';

const ModalDelete = ({ modalVisible, setModalVisible, onPressDelete, title = "Delete", description = "Are you sure you want to delete this item?", confirmButtonLabel }) => {

    const strings = useTranslation();
    const confirmLabel = confirmButtonLabel ?? strings.modalDelete.deleteBtn;

    const handleCancelButton = () => {
        setModalVisible(!modalVisible)
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            statusBarTranslucent={true}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}>


            <View style={styles.container}>
                    {/* <View style={styles.blueRow} /> */}
                <View style={styles.modalContent}>
                    {/* Icon warning   */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="warning-outline" size={48} color={Colors.error} />
                    </View>
                    <Text size="l" weight="bold" color="primary" style={styles.headerText}>{title}</Text>
                    <Text color="primary" style={styles.descriptionText}>{description}</Text>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity onPress={handleCancelButton} style={styles.cancelButton}>
                            <Text color="primary" style={styles.cancelButtonText}>{strings.modalDelete.cancelBtn}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onPressDelete} style={styles.deleteButton}>
                            <Text weight="bold" color="light" style={styles.deleteButtonText}>{confirmLabel}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
export default ModalDelete;

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
        paddingVertical: 25,
        borderBottomWidth: 20,
        borderColor: Colors.error,
    },
    headerText: {
        textAlign: 'center',
    },
    descriptionText: {
        textAlign: 'center',
        marginTop: 20,
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        gap: 20,
        paddingHorizontal: 10
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: Colors.sheetBorder,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
        flex: 1
    },
    cancelButtonText: {
        textAlign: 'center'
    },
    deleteButton: {
        backgroundColor: Colors.error,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
        flex: 1
    },
    deleteButtonText: {
        textAlign: 'center'
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
});
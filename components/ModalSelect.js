// React / React-Native
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
// Utils
import Colors from "../utils/colors";
import formatNumberWithCommas from "../utils/formatNumberWithCommas";
// Icons
import { MaterialIcons } from '@expo/vector-icons';
// Context
import { useContext } from "react";
import { ExpensiaContext } from "../context/expensiaContext";
// Languages
import { es, en } from "../utils/languages";

const ModalSelect = ({ modalVisible, setModalVisible, data, selectedValue, handleSelectedModal }) => {


    const { user } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;

    const handleSendSelected = (item) => {

        handleSelectedModal(item)
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
            <View style={styles.mainContainer} >

                <View style={styles.moduleBox}>

                    <ScrollView contentContainerStyle={{ justifyContent: 'center', flexGrow: 1, alignItems: 'center' }}>
                        {data.map((item, index) => (

                            <TouchableOpacity
                                key={index}
                                style={[styles.rowModule, selectedValue.id === item.id ? styles.rowSelectedModule : null]}
                                onPress={handleSendSelected.bind(null, item)}
                            >
                                <View>
                                    <Text style={styles.txtModule}>{item.name}</Text>
                                    <Text style={[styles.txtModule, { fontFamily: 'Poppins-Light' }]}>${formatNumberWithCommas(item.amount)}</Text>
                                </View>
                                {selectedValue.id === item.id && <MaterialIcons name="check" size={24} color={Colors.primary} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
                        <View style={styles.btnContainer}>
                            <Text style={styles.txtBtn}>{strings.modalSelect.btnAccept}</Text>
                        </View>
                    </TouchableOpacity>
                </View>



            </View>


        </Modal>
    )

}
export default ModalSelect;

const styles = StyleSheet.create({
    txtModule: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 18,
        color: Colors.primary
    },
    rowModule: {
        flexDirection: "row",
        padding: 10,
        width: '90%',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    rowSelectedModule: {
        borderWidth: 0.5,
        borderRadius: 10,
        borderColor: Colors.secondary
    },
    moduleBox: {
        backgroundColor: Colors.light,
        paddingTop: 15,
        width: '90%',
        height: '50%',

        borderRadius: 20,
        justifyContent: 'center'
    },
    btnContainer: {
        backgroundColor: Colors.secondary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '100%',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    txtBtn: {
        fontFamily: 'Poppins-Light',
        color: Colors.light,
        textAlign: 'center'
    },
    mainContainer: {
        backgroundColor: '#06002e99',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
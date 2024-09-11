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
import { useContext, useRef, useMemo, useCallback, useEffect } from "react";
import { ExpensiaContext } from "../context/expensiaContext";
// Languages
import { es, en } from "../utils/languages";
import { TouchableOpacity as TouchableOpacityMod, BottomSheetModal } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ModalSelect = ({ modalVisible, setModalVisible, data, selectedValue, handleSelectedModal }) => {


    const { user } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;

    const handleSendSelected = (item) => {

        handleSelectedModal(item)
        setModalVisible(!modalVisible)
    }

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
            enableDismissOnClose
            onDismiss={() => setModalVisible(false)}
            handleIndicatorStyle={{ backgroundColor: "#d6d5dd" }}
            handleComponent={() => <View style={{ justifyContent: "center", alignItems: "center" }}>
                <View style={{ width: 40, height: 4, backgroundColor: "#d6d5dd", marginTop: 10, borderRadius: 2 }}>
                </View>
            </View>}
            backgroundStyle={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#d6d5dd", borderRadius: 40 }}
        >
            <View style={{ alignItems: "flex-end", width: "95%" }}>
                <TouchableOpacityMod onPress={() => closeModal()} >
                    <MaterialCommunityIcons name="close" size={24} color={"#d6d5dd"} />
                </TouchableOpacityMod>
            </View>


            <Text style={styles.chooseTxt}>{strings.modalSelect.chooseAccount}</Text>
            <ScrollView contentContainerStyle={{ alignItems: 'center', marginTop: 24 }}>
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


        </BottomSheetModal>
    )

}
export default ModalSelect;

const styles = StyleSheet.create({
    txtModule: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 18,
        color: Colors.primary
    },
    chooseTxt: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 18,
        color: Colors.primary,
        textAlign: "center"
    },
    rowModule: {
        flexDirection: "row",
        padding: 10,
        width: '98%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20
    },
    rowSelectedModule: {
        borderWidth: 0.5,
        borderRadius: 10,
        borderColor: Colors.secondary
    },
    moduleBox: {
        backgroundColor: Colors.light,
        paddingTop: 15,
        width: '100%',
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
        marginBottom: 24
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
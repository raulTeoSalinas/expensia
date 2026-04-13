// React / React-Native
import {
    Modal,
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import Text from '@components/Text';
// Utils
import Colors from "../constants/colors";

// Icons
import { MaterialIcons } from '@expo/vector-icons';
// Context
import { useContext, useRef, useMemo, useCallback, useEffect } from "react";
import { ExpensiaContext } from "../context/expensiaContext";
// Languages
import { es, en } from "../utils/languages";
//Categories
import Category from "../utils/category";
import { TouchableOpacity as TouchableOpacityMod, BottomSheetModal } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const ModalSelectCategory = ({ modalVisible, setModalVisible, selectedValue, handleSelectedModal }) => {


    const { user } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;


    const categories = Category.filter(category => selectedValue?.type && category.type === selectedValue.type || category.type === "o")

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

            <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', marginTop: 24 }}>
                {selectedValue && categories.map((category, index) => (

                    <TouchableOpacity
                        key={index}
                        style={[styles.rowModule, selectedValue.id === category.id && styles.rowSelectedModule]}
                        onPress={handleSendSelected.bind(null, category)}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <MaterialCommunityIcons name={category.icon} size={28} color={Colors.secondary} style={styles.iconCategory} />
                            <Text weight="bold" color="primary" size="l">{user && user.language === "en" ? category.nameEN : category.nameES}</Text>
                        </View>
                        {selectedValue.id === category.id && <MaterialIcons name="check" size={24} color={Colors.primary} />}
                    </TouchableOpacity>
                ))
                }
            </ScrollView>



        </BottomSheetModal>
    )

}
export default ModalSelectCategory;

const styles = StyleSheet.create({
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
        maxHeight: "80%",

        borderRadius: 20,
        justifyContent: 'center'
    },
    mainContainer: {
        backgroundColor: Colors.overlay,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconCategory: {
        marginRight: '5%'
    }
});
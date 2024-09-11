// React / React-Native
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,

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
//Categories
import Category from "../utils/category";


const ModalSelectCategory = ({ modalVisible, setModalVisible, selectedValue, handleSelectedModal }) => {


    const { user } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;


    const categories = Category.filter(category => selectedValue?.type && category.type === selectedValue.type || category.type === "o")

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

                    <ScrollView contentContainerStyle={{ justifyContent: 'center', flexGrow: 1, alignItems: 'center', paddingBottom: 15 }}>
                        {selectedValue && categories.map((category, index) => (

                            <TouchableOpacity
                                key={index}
                                style={[styles.rowModule, selectedValue.id === category.id && styles.rowSelectedModule]}
                                onPress={handleSendSelected.bind(null, category)}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    {category.src !== '' ?
                                        <Image style={styles.iconCategory} source={category.src} />
                                        : <View style={styles.iconCategory}></View>
                                    }

                                    <Text style={styles.txtModule}>{user && user.language === "en" ? category.nameEN : category.nameES}</Text>
                                </View>
                                {selectedValue.id === category.id && <MaterialIcons name="check" size={24} color={Colors.primary} />}
                            </TouchableOpacity>
                        ))
                        }
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
export default ModalSelectCategory;

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
        maxHeight: "80%",

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
    },
    iconCategory: {
        width: 40,
        height: 40,
        marginRight: '5%'
    }
});
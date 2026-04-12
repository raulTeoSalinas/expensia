// React / React-Native
import { useContext } from "react";
import { StyleSheet, View, Platform, TouchableOpacity, Image } from "react-native";
import Text from '@components/Text';
// Navigation
import { useNavigation } from "@react-navigation/native";
// Context
import { ExpensiaContext } from "../context/expensiaContext";
// Utils
import { es, en } from "../utils/languages";
import Colors from "../constants/colors";




const TypeTransactionScreen = () => {

    const navigation = useNavigation();

    const handleTransactionNavigate = (type) => {
        navigation.goBack();
        navigation.navigate("Transaction", { typeTrans: type });
    }

    const { user } = useContext(ExpensiaContext);

    const strings = user && user.language === "en" ? en : es;


    return (
        <View style={{ flexDirection: 'row', flex: 1 }}>
            <TouchableOpacity onPress={handleTransactionNavigate.bind(null, "i")} activeOpacity={0.8} style={[styles.typeContainer, { backgroundColor: Colors.typeIncomeBackground }]}>
                <Text weight="bold" color="white" style={styles.txtType}>{strings.typeTransactionScreen.addIncomeTxt}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleTransactionNavigate.bind(null, "e")} activeOpacity={0.8} style={[styles.typeContainer, { backgroundColor: Colors.typeExpenseBackground }]}>
                <Text weight="bold" color="white" style={styles.txtType}>{strings.typeTransactionScreen.addExpenseTxt}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleTransactionNavigate.bind(null, "l")} activeOpacity={0.8} style={[styles.typeContainer, { backgroundColor: Colors.typeLoanBackground }]}>
                <Text weight="bold" color="white" style={[styles.txtType, { marginHorizontal: 5 }]}>{strings.typeTransactionScreen.addLoanTxt}</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} style={styles.opacity} onPress={navigation.goBack}  >
                <Image style={styles.buttonIcon} source={require('../assets/images/icon-close.png')} />
            </TouchableOpacity>

        </View>
    );
}

export default TypeTransactionScreen;

const styles = StyleSheet.create({
    typeContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center'
    },
    txtType: {
        fontSize: 20,
        textAlign: 'center'
    },
    buttonIcon: {
        resizeMode: 'contain',
        width: 50,
        height: 50,
    },
    opacity: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? "8%" : "4.5%",
        right: 10,
        width: 60,
        height: 60,

    }
})

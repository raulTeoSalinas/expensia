// React / React-Native
import { useContext } from "react";
import { StyleSheet, View, Platform, Text, TouchableOpacity, Image } from "react-native";
// Navigation
import { useNavigation } from "@react-navigation/native";
// Context
import { ExpensiaContext } from "../context/expensiaContext";
// Utils
import { es, en } from "../utils/languages";


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
            <TouchableOpacity onPress={handleTransactionNavigate.bind(null, "i")} activeOpacity={0.8} style={[styles.typeContainer, { backgroundColor: '#2606f9b3' }]}>
                <Text style={styles.txtType}>{strings.typeTransactionScreen.addIncomeTxt}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleTransactionNavigate.bind(null, "e")} activeOpacity={0.8} style={[styles.typeContainer, { backgroundColor: '#f906d8b3', }]}>
                <Text style={styles.txtType}>{strings.typeTransactionScreen.addExpenseTxt}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleTransactionNavigate.bind(null, "l")} activeOpacity={0.8} style={[styles.typeContainer, { backgroundColor: '#06002eb3' }]}>
                <Text style={styles.txtType}>{strings.typeTransactionScreen.addLoanTxt}</Text>
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
        fontFamily: 'poppins-bold',
        color: 'white',
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

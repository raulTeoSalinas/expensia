// React / React-Native
import { useContext } from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Text from '@components/Text';
import GradientText from '@components/TextGradient';
// Navigation
import { useNavigation } from "@react-navigation/native";
// Context
import { ExpensiaContext } from '@context/expensiaContext'
import { useAuth } from '@context/authContext'
// Utils
import { es, en } from '@utils/languages'
import Colors from '@constants/colors'
import { closeFabContainerStyle, closeFabIconStyle } from '@utils/closeFabLayout'
// Icons
import { MaterialIcons } from '@expo/vector-icons';


const TypeTransactionScreen = ({ route }) => {

    const navigation = useNavigation();
    const insets = useSafeAreaInsets()
    const prefillDate = route?.params?.date ?? null

    const handleTransactionNavigate = (type) => {
        navigation.goBack();
        navigation.navigate("Transaction", { typeTrans: type, ...(prefillDate ? { date: prefillDate } : {}) });
    }

    const { user } = useContext(ExpensiaContext);
    const { isLoggedIn } = useAuth()

    const strings = user && user.language === "en" ? en : es;


    return (
        <View style={{ flexDirection: 'row', flex: 1 }}>
            <TouchableOpacity onPress={handleTransactionNavigate.bind(null, "i")} activeOpacity={0.8} style={[styles.typeContainer, { backgroundColor: Colors.typeIncomeBackground }]}>
                <Text weight="bold" color="white" style={styles.txtType}>{strings.typeTransactionScreen.addIncomeTxt}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleTransactionNavigate.bind(null, "e")} activeOpacity={0.8} style={[styles.typeContainer, { backgroundColor: Colors.typeExpenseBackground }]}>
                <Text weight="bold" color="white" style={styles.txtType}>{strings.typeTransactionScreen.addExpenseTxt}</Text>
            </TouchableOpacity>


            {isLoggedIn && (
                <TouchableOpacity onPress={() => navigation.navigate('IATransactions')} activeOpacity={0.8} style={[styles.typeContainer, { backgroundColor: Colors.typeVoiceBackground }]}>
                    <View style={styles.brandRow}>
                        <Text weight="bold" color="white" style={styles.txtType}>Expens </Text>
                        <View style={styles.iaContainer}>
                            <GradientText style={[styles.txtType,]} weight="bold">IA</GradientText>
                        </View>
                        
                    </View>
                    {/* microphone icon material icons */}

                    <MaterialIcons name="mic" size={24} color={Colors.white} />

                </TouchableOpacity>
            )}

            <TouchableOpacity activeOpacity={0.7} style={closeFabContainerStyle(insets)} onPress={navigation.goBack} hitSlop={12}>
                <Image style={closeFabIconStyle} source={require('../assets/images/icon-close.png')} />
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
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iaContainer: {

        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.white,
    },

})

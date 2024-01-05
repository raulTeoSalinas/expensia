// React / React-Native
import { useContext } from "react";
import {
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Dimensions
} from "react-native";
// Utils
import Colors from "../utils/colors";
import formatNumberWithCommas from "../utils/formatNumberWithCommas";
import { es, en } from "../utils/languages";
// Navigation
import { useNavigation } from "@react-navigation/native";
// Context
import { ExpensiaContext } from "../context/expensiaContext";


const { width } = Dimensions.get('window');

const TransactionCard = ({ id, type, amount, account, date, category, description }) => {

    const navigation = useNavigation();

    const handleNavigateTransaction = () => {
        navigation.navigate("Transaction", { id: id });
    }
    const { user } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;


    return (
        <TouchableOpacity onPress={handleNavigateTransaction}>
            <View style={[styles.cardContainer,
            {
                backgroundColor:
                    type === 'i' ? Colors.secondary : type === 'e' ? Colors.accent : Colors.primary
            }
            ]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center', borderBottomWidth: 1, borderColor: Colors.light }}>
                    <Text style={styles.txtAmount}>
                        {type === 'i' ? strings.transactionCard.typeIncome
                            : type === 'e' ? strings.transactionCard.typeExpense
                                : strings.transactionCard.typeLoan}
                    </Text>

                    <Text style={styles.txtAmount}>${formatNumberWithCommas(amount)}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 5 }}>
                    <Text style={styles.txtBold}>{strings.transactionCard.account}<Text style={styles.txt}>{account.name}</Text></Text>
                    <Text style={styles.txtBold}>{strings.transactionCard.date}<Text style={styles.txt}>{date}</Text></Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: 'flex-start' }}>
                    <Text style={styles.txtBold}>{strings.transactionCard.category}
                        <Text style={styles.txt}>{user && user.language === "en" ? category.nameEN : category.nameES}</Text>
                    </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: 'flex-start' }}>
                    <Text style={styles.txtBold}>{strings.transactionCard.description}
                        <Text style={styles.txt}> {description.length > 15 ? description.slice(0, 20) + '...' : description || strings.transactionCard.noDescription}</Text>
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default TransactionCard;

const styles = StyleSheet.create({
    cardContainer: {
        alignSelf: 'stretch',
        width: width - 40,
        marginVertical: 10,
        borderRadius: 20,
        borderWidth: 3,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderColor: '#ffffff'
    },
    txtBold: {
        fontFamily: 'poppins-bold',
        color: Colors.light,
    },
    txt: {
        fontFamily: 'poppins',
        color: Colors.light,
    },
    txtAmount: {
        fontFamily: 'poppins-bold',
        color: Colors.light,
        fontSize: 18
    }
})
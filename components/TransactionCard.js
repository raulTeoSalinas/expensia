// React / React-Native
import { useContext } from "react";
import {
    TouchableOpacity,
    View,
    StyleSheet,
    Dimensions
} from "react-native";
import Text from '@components/Text';
// Utils
import Colors from "../constants/colors";
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
                    type === 'i' ? Colors.secondary : Colors.accent
            }
            ]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center', borderBottomWidth: 1, borderColor: Colors.light }}>
                    <Text weight="bold" color="light" size="l">
                        {type === 'i' ? strings.transactionCard.typeIncome : strings.transactionCard.typeExpense}
                    </Text>

                    <Text weight="bold" color="light" size="l">${formatNumberWithCommas(amount)}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 5 }}>
                    <Text weight="bold" color="light">{strings.transactionCard.account}<Text color="light">{account.name}</Text></Text>
                    <Text weight="bold" color="light">{strings.transactionCard.date}<Text color="light">{date}</Text></Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: 'flex-start' }}>
                    <Text weight="bold" color="light">{strings.transactionCard.category}
                        <Text color="light">{user && user.language === "en" ? category.nameEN : category.nameES}</Text>
                    </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: 'flex-start' }}>
                    <Text weight="bold" color="light">{strings.transactionCard.description}
                        <Text color="light"> {description.length > 15 ? description.slice(0, 20) + '...' : description || strings.transactionCard.noDescription}</Text>
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
        borderColor: Colors.white
    },
})
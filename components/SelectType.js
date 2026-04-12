// React / React-Native
import { useState, useContext } from "react";
import {
    View,
    TouchableOpacity,
    StyleSheet
} from "react-native";
import Text from '@components/Text';
// Utils
import Colors from "../constants/colors";
import { es, en } from "../utils/languages";
// Context
import { ExpensiaContext } from "../context/expensiaContext";


const SelectType = ({ getTypeSelected, resetFlat }) => {

    const { user } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;

    const [typeSelected, setTypeSelected] = useState('all');

    const handleTypeSelect = (type) => {
        setTypeSelected(type);
        getTypeSelected(type);
    };

    return (
        <View style={styles.rowContainer}>

            <TouchableOpacity onPress={() => handleTypeSelect('all')}>

                <View style={[styles.container, typeSelected === 'all' && { backgroundColor: Colors.primary }]}>

                    <Text weight="bold" color={typeSelected === 'all' ? 'light' : 'primary'} style={styles.txt}>{strings.transactionsScreen.selectTypeAll}</Text>

                </View>

            </TouchableOpacity >
            <TouchableOpacity onPress={() => handleTypeSelect('income')}>

                <View style={[styles.container, typeSelected === 'income' && { backgroundColor: Colors.secondary }]}>

                    <Text weight="bold" color={typeSelected === 'income' ? 'light' : 'primary'} style={styles.txt}>{strings.transactionsScreen.selectTypeIncome}</Text>

                </View>

            </TouchableOpacity >
            <TouchableOpacity onPress={() => handleTypeSelect('expenses')}>

                <View style={[styles.container, typeSelected === 'expenses' && { backgroundColor: Colors.accent }]}>

                    <Text weight="bold" color={typeSelected === 'expenses' ? 'light' : 'primary'} style={styles.txt}>{strings.transactionsScreen.selectTypeExpenses}</Text>

                </View>

            </TouchableOpacity >
        </View>
    )
};

export default SelectType;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 15,
        paddingVertical: 3,
        borderRadius: 10,

    },
    txt: {
        includeFontPadding: false
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: 'flex-start',
        marginVertical: 12,
        marginHorizontal: '5%',
        gap: 10
    }
});
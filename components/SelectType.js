// React / React-Native
import { useState, useContext} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet
} from "react-native";
// Utils
import Colors from "../utils/colors";
import { es, en } from "../utils/languages";
// Context
import { ExpensiaContext } from "../context/expensiaContext";


const SelectType = ({getTypeSelected, resetFlat}) => {

    const { user } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;

    const [typeSelected, setTypeSelected] = useState('all');

    const handleTypeSelect = (type) => {
      setTypeSelected(type);
      getTypeSelected(type);
    };

    return (
        <View style={styles.rowContainer}>

            <TouchableOpacity onPress={()=>handleTypeSelect('all')}>

                <View style={[styles.container, typeSelected === 'all' && {backgroundColor: Colors.secondary} ]}>

                    <Text style={[styles.txt, typeSelected === 'all' && {color: Colors.light} ]}>{strings.transactionsScreen.selectTypeAll}</Text>

                </View>

            </TouchableOpacity >
            <TouchableOpacity onPress={()=>handleTypeSelect('income')}>

                <View style={[styles.container, typeSelected === 'income' && {backgroundColor: Colors.secondary} ]}>

                    <Text style={[styles.txt, typeSelected === 'income' && {color: Colors.light} ]}>{strings.transactionsScreen.selectTypeIncome}</Text>

                </View>

            </TouchableOpacity >
            <TouchableOpacity onPress={()=>handleTypeSelect('expenses')}>

                <View style={[styles.container, typeSelected === 'expenses' && {backgroundColor: Colors.secondary} ]}>

                    <Text style={[styles.txt, typeSelected === 'expenses' && {color: Colors.light} ]}>{strings.transactionsScreen.selectTypeExpenses}</Text>

                </View>

            </TouchableOpacity >
            <TouchableOpacity onPress={()=>handleTypeSelect('loans')}>

                <View style={[styles.container, typeSelected === 'loans' && {backgroundColor: Colors.secondary} ]}>

                    <Text style={[styles.txt, typeSelected === 'loans' && {color: Colors.light} ]}>{strings.transactionsScreen.selectTypeLoans}</Text>

                </View>

            </TouchableOpacity>
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
        fontFamily: 'poppins-bold',
        color: Colors.primary,
        includeFontPadding: false
    },
    rowContainer: {
        flexDirection: "row", 
        justifyContent: 'space-evenly', 
        marginVertical: 12
    }
});
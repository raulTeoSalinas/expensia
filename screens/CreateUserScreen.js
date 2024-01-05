// React / React-Native
import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Dimensions
} from "react-native";
// Utils
import Colors from "../utils/colors";
import { es, en } from "../utils/languages";
// Components
import GradientText from "../components/TextGradient";
// Third Party Libraries
import { LinearGradient } from "expo-linear-gradient";


const {width} = Dimensions.get('window')

const CreateUserScreen = ({ navigation }) => {
    
    const [txtEmpyLoad, setTxtEmptyLoad] = useState(true);
    const [text, setText] = useState('');
    const [language, setLanguage] = useState("en");

    const strings = language === "en" ? en : es;

    const handleChangeText = (inputText) => {
        setText(inputText)
        setTxtEmptyLoad(true)
    }

    const handleNavigateAccounts = () => {

        if (text === '') {

            setTxtEmptyLoad(false)

        } else {

            navigation.navigate("CreateAccounts", { userName: text, language: language });
            
        }
    }

    return (
        <LinearGradient style={{flex: 1}} colors={[Colors.secondary, Colors.accent, Colors.accent, Colors.secondary ]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.mainContainer}>

                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.txtWelcome}>{strings.createUserScreen.welcomeTxt}</Text>
                    <GradientText style={styles.txtWelcome}>Expensia</GradientText>
                </View>
                <Text style={styles.txtName}>{strings.createUserScreen.chooseLanguage}</Text>
                <View style={styles.containerLanguages}>
                    <TouchableOpacity onPress={() => setLanguage("en")} style={[styles.containerLanguage, language === "en" && styles.selectedLanguage]}>
                        <Text>English</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setLanguage("es")} style={[styles.containerLanguage, language === "es" && styles.selectedLanguage]}>
                        <Text>Español</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.txtName}>{strings.createUserScreen.enterFName}</Text>
                <TextInput
                    style={[styles.txtInput, txtEmpyLoad ? null : { borderColor: 'red', borderWidth: 2 }]}
                    onChangeText={handleChangeText}
                    value={text}
                    maxLength={18}
                    returnKeyType='done'
                    inputMode='text'
                    placeholder="John"
                    blurOnSubmit

                />

                <TouchableOpacity onPress={handleNavigateAccounts}>
                    <View style={styles.btnContainer}>
                        <Text style={{ fontFamily: 'poppins', color: Colors.light }}>{strings.createUserScreen.acceptBtn}</Text>
                    </View>
                </TouchableOpacity>

            </View>
        </LinearGradient>
    );
}

export default CreateUserScreen;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderTopLeftRadius: width-100,
        borderBottomRightRadius: width-100
    },
    txtWelcome: {
        fontFamily: 'poppins-bold',
        color: Colors.primary,
        fontSize: 25,
        marginBottom: '10%'
    },
    txtName: {
        fontFamily: 'poppins',
        marginTop: 20
    },
    txtInput: {
        backgroundColor: 'white',
        height: 40,
        width: 270,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontFamily: 'poppins',
        fontSize: 15,
        borderWidth: 0.5,
        borderColor: Colors.secondary,
        color: Colors.primary,
        marginTop: '2%'
    },
    containerLanguages: {
        width: '50%',
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        marginTop: '2%',
        marginBottom: "10%"
    },
    containerLanguage: {
        
        borderRadius: 10,

        padding: 15
    },
    selectedLanguage : {
        borderColor: Colors.secondary,
        borderWidth: 0.5,
    },
    btnContainer: {
        backgroundColor: Colors.primary, 
        paddingHorizontal: 20, 
        paddingVertical: 5, 
        marginTop: "15%", 
        borderRadius: 10,
        
    }
});
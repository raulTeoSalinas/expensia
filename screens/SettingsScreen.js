// React / React-Native
import { useState, useContext, useEffect } from "react";
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    TextInput
} from "react-native";
// AsyncStorage
import expensiaAsyncStorage from "../context/expensiaAsyncStorage";
// Components
import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";
import SettingsBtn from "../components/SettingsBtn";
import ModalSettingsBtns from "../components/ModalSettingsBtns";
// Utils
import Colors from "../utils/colors";
import { es, en } from "../utils/languages";
// Context
import { ExpensiaContext } from "../context/expensiaContext";
// Icons
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SettingsScreen = ({navigation}) => {

    const { clearTransactionsAsync, deleteUserAsync, editUserLanguageAsync, updateUserNameAsync, togglePrivacyAsyncStorage } = expensiaAsyncStorage;
    const { user, editUserLanguage, updateUserName, togglePrivacy, clearTransactions } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;

    const [modalVisibleLanguage, setModalVisibleLanguage] = useState(false);
    const [modalVisibleEditName, setModalVisibleEditName] = useState(false);
    const [modalVisibleDeleteTransactions, setModalVisibleDeleteTransactions] = useState(false);
    const [modalVisibleDeleteAll, setModalVisibleDeleteAll] = useState(false);

    const [txtName, setTxtName] = useState("");
    const [txtNameEmptyLoad, setTxtNameEmptyLoad] = useState(true);

    useEffect(() => {
        setTxtName(user.name)
    }, [])

    const handleChangeTxtName = (inputTxt) => {
        setTxtName(inputTxt)
    }

    const handleChangeName = () => {
        if (txtName === "") {
            setTxtNameEmptyLoad(false);
        } else {
            updateUserName(txtName);
            updateUserNameAsync(txtName);
            setModalVisibleEditName(!modalVisibleEditName);
        }
    }

    const handleChangeLanguage = (language) => {
        editUserLanguage(language);
        editUserLanguageAsync(language)
        setModalVisibleLanguage(!modalVisibleLanguage)
    }

    const handleTogglePrivacy = () => {
        togglePrivacyAsyncStorage();
        togglePrivacy();
    }

    const handleDeleteTransactions = () => {
        clearTransactionsAsync();
        clearTransactions();
        setModalVisibleDeleteTransactions(!modalVisibleDeleteTransactions);
    }

    const handleDeleteAll = () => {
        clearTransactionsAsync();
        clearTransactions();
        deleteUserAsync();
        setModalVisibleDeleteAll(!modalVisibleDeleteAll);
        navigation.navigate("CreateUser");
    }

    return (
        <ScreenContainer>
            <Header darkText={strings.settingsScreen.headerDarkTxt} gradientText={strings.settingsScreen.headerGradientTxt} />
            <View style={styles.btnsContainer}>
                <SettingsBtn
                    title={strings.settingsScreen.changeLanguage}
                    description={strings.settingsScreen.descriptionLanguage + (user && user.language === "en" ? "English" : "Español")}
                    icon="language"
                    iconColor={Colors.secondary}
                    onPress={() => setModalVisibleLanguage(!modalVisibleLanguage)}
                />
                <SettingsBtn
                    title={strings.settingsScreen.editName}
                    description={strings.settingsScreen.descriptionName + (user && user.name)}
                    icon="lead-pencil"
                    iconColor={Colors.secondary}
                    onPress={() => setModalVisibleEditName(!modalVisibleEditName)}
                />
                <SettingsBtn
                    title={strings.settingsScreen.changePrivacy}
                    description={strings.settingsScreen.descriptionPrivacy}
                    icon={ user && !user.privacy ? "eye" : "eye-off" }
                    iconColor={Colors.secondary}
                    onPress={handleTogglePrivacy}
                />
                <SettingsBtn
                    title={strings.settingsScreen.deleteTransactions}
                    description={strings.settingsScreen.descriptionTransactions}
                    icon="trash-can-outline"
                    iconColor="red"
                    onPress={() => setModalVisibleDeleteTransactions(!modalVisibleDeleteTransactions)}
                />
                <SettingsBtn
                    title={strings.settingsScreen.deleteAll}
                    description={strings.settingsScreen.descriptionAll}
                    icon="restart-alert"
                    iconColor="red"
                    onPress={() => setModalVisibleDeleteAll(!modalVisibleDeleteAll)}
                />
            </View>

            <ModalSettingsBtns
                modalVisible={modalVisibleLanguage}
                setModalVisible={setModalVisibleLanguage}
                title={strings.settingsScreen.changeLanguage}
                actionAccept={() => setModalVisibleLanguage(!modalVisibleLanguage)}
            >
                <TouchableOpacity onPress={handleChangeLanguage.bind(null, "en")} style={[styles.containerLanguageTxt, user && user.language === 'en' && styles.containerSelectedLanguageTxt]}>
                    <Text style={styles.languageTxt}>English</Text>
                    {user && user.language === 'en' &&
                        <MaterialCommunityIcons name="check" size={24} color={Colors.secondary} />
                    }
                </TouchableOpacity>
                <TouchableOpacity onPress={handleChangeLanguage.bind(null, "es")} style={[styles.containerLanguageTxt, user && user.language === 'es' && styles.containerSelectedLanguageTxt]}>
                    <Text style={styles.languageTxt}>Español</Text>
                    {user && user.language === 'es' &&
                        <MaterialCommunityIcons name="check" size={24} color={Colors.secondary} />
                    }
                </TouchableOpacity>
            </ModalSettingsBtns>

            <ModalSettingsBtns
                modalVisible={modalVisibleEditName}
                setModalVisible={setModalVisibleEditName}
                title={strings.settingsScreen.editName}
                actionAccept={handleChangeName}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.txtNameInput, txtNameEmptyLoad ? null : { borderColor: 'red', borderWidth: 2 }]}
                        onChangeText={handleChangeTxtName}
                        value={txtName}
                        returnKeyType='done'
                        inputMode='text'
                        placeholder="Enter your first name"
                        blurOnSubmit
                        maxLength={18}
                    />
                </View>

            </ModalSettingsBtns>

            <ModalSettingsBtns
                modalVisible={modalVisibleDeleteTransactions}
                setModalVisible={setModalVisibleDeleteTransactions}
                title={strings.settingsScreen.deleteTransactions}
                warning
                actionAccept={handleDeleteTransactions}
            >
                <Text style={styles.modalTxt}>
                    {strings.settingsScreen.deleteTransactionsModal}
                </Text>

            </ModalSettingsBtns>

            <ModalSettingsBtns
                modalVisible={modalVisibleDeleteAll}
                setModalVisible={setModalVisibleDeleteAll}
                title={strings.settingsScreen.deleteAll}
                warning
                actionAccept={handleDeleteAll}
            >
                <Text style={styles.modalTxt}>
                    {strings.settingsScreen.deleteAllModal}
                </Text>
            </ModalSettingsBtns>


        </ScreenContainer>
    );
};


export default SettingsScreen;

const styles = StyleSheet.create({
    btnsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    containerLanguageTxt: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '10%',
        paddingVertical: '3%'
    },
    containerSelectedLanguageTxt: {
        borderWidth: 0.5,
        borderRadius: 10,
        borderColor: Colors.secondary
    },
    languageTxt: {
        fontFamily: 'poppins',
        includeFontPadding: false,
        color: Colors.primary
    },
    modalTxt: {
        fontFamily: 'poppins',
        includeFontPadding: false,
        color: Colors.primary,
        textAlign: 'center'
    },
    inputContainer: {
        height: 40
    },
    txtNameInput: {
        backgroundColor: 'white',
        height: 40,
        flex: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontFamily: 'poppins',
        fontSize: 15,
        borderWidth: 0.5,
        borderColor: Colors.secondary,
        color: Colors.primary,
    }

})
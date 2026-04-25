// React / React-Native
import { useState, useRef, useMemo } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Modal,
    ActivityIndicator,
} from "react-native";
import Text from '@components/Text';
// Utils
import Colors from "../constants/colors";
import { es, en } from "../utils/languages";
// Components
import GradientText from "../components/TextGradient";
// Third Party Libraries
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from '../context/authContext';

const { width } = Dimensions.get('window')

const TAPS_REQUIRED = 20
const TAP_RESET_MS = 3000

const CreateUserScreen = ({ navigation }) => {

    const [txtEmpyLoad, setTxtEmptyLoad] = useState(true);
    const [text, setText] = useState('');
    const [language, setLanguage] = useState("en");
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);

    const tapCount = useRef(0);
    const tapTimer = useRef(null);

    const { login } = useAuth();

    const strings = language === "en" ? en : es;

    const welcomeParts = useMemo(() => {
        const full = strings.createUserScreen.welcomeTxt;
        const suffix = language === 'en' ? 'to ' : 'a ';
        if (full.endsWith(suffix)) {
            return { prefix: full.slice(0, -suffix.length), suffix };
        }
        return { prefix: full, suffix: null };
    }, [strings, language]);

    const handleWelcomeSecretPress = () => {
        clearTimeout(tapTimer.current);
        tapCount.current += 1;
        if (tapCount.current >= TAPS_REQUIRED) {
            tapCount.current = 0;
            setShowLoginModal(true);
            return;
        }
        tapTimer.current = setTimeout(() => { tapCount.current = 0; }, TAP_RESET_MS);
    };

    const handleLogin = async () => {
        if (!loginEmail || !loginPassword) return;
        setLoginLoading(true);
        setLoginError(null);
        try {
            await login(loginEmail, loginPassword);
            setShowLoginModal(false);
            setLoginEmail('');
            setLoginPassword('');
        } catch (e) {
            setLoginError('Correo o contraseña incorrectos');
        } finally {
            setLoginLoading(false);
        }
    };

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
        <LinearGradient style={{ flex: 1 }} colors={[Colors.secondary, Colors.accent, Colors.accent, Colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.mainContainer}>

                <View style={{ flexDirection: 'row' }}>
                    <Text weight="bold" color="primary" style={styles.txtWelcome}>
                        {welcomeParts.prefix}
                        {welcomeParts.suffix ? (
                            <Text
                                weight="bold"
                                color="primary"
                                style={styles.txtWelcomeSuffix}
                                onPress={handleWelcomeSecretPress}
                                suppressHighlighting
                            >
                                {welcomeParts.suffix}
                            </Text>
                        ) : null}
                    </Text>
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
                    style={[styles.txtInput, txtEmpyLoad ? null : { borderColor: Colors.error, borderWidth: 2 }]}
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
                        <Text color="light">{strings.createUserScreen.acceptBtn}</Text>
                    </View>
                </TouchableOpacity>

                <Modal visible={showLoginModal} transparent animationType="fade" onRequestClose={() => setShowLoginModal(false)}>
                    <View style={styles.loginOverlay}>
                        <View style={styles.loginCard}>
                            <Text weight="bold" color="primary" style={styles.loginTitle}>Iniciar sesión</Text>
                            <TextInput
                                style={styles.loginInput}
                                placeholder="Correo"
                                value={loginEmail}
                                onChangeText={setLoginEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor={Colors.secondary}
                            />
                            <TextInput
                                style={styles.loginInput}
                                placeholder="Contraseña"
                                value={loginPassword}
                                onChangeText={setLoginPassword}
                                secureTextEntry
                                placeholderTextColor={Colors.secondary}
                            />
                            {loginError ? (
                                <Text style={styles.loginError}>{loginError}</Text>
                            ) : null}
                            <View style={styles.loginBtns}>
                                <TouchableOpacity onPress={() => { setShowLoginModal(false); setLoginError(null); }} style={styles.loginBtnCancel}>
                                    <Text color="primary">Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleLogin} style={styles.loginBtnAccept} disabled={loginLoading}>
                                    {loginLoading
                                        ? <ActivityIndicator size="small" color={Colors.white} />
                                        : <Text style={{ color: Colors.white }} weight="bold">Entrar</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

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
        backgroundColor: Colors.white,
        borderTopLeftRadius: width - 100,
        borderBottomRightRadius: width - 100
    },
    txtWelcome: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 25,
        marginBottom: '10%',
    },
    txtWelcomeSuffix: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 25,
    },
    txtName: {
        marginTop: 20
    },
    txtInput: {
        backgroundColor: Colors.white,
        height: 40,
        width: 270,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontFamily: 'Poppins-Light',
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
    selectedLanguage: {
        borderColor: Colors.secondary,
        borderWidth: 0.5,
    },
    btnContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 8,
        marginTop: "15%",
        borderRadius: 10,
        width: 270,
    },
    loginOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 24,
        width: '80%',
        gap: 12,
    },
    loginTitle: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 4,
    },
    loginInput: {
        borderWidth: 0.5,
        borderColor: Colors.secondary,
        borderRadius: 10,
        paddingHorizontal: 14,
        height: 44,
        fontFamily: 'Poppins-Light',
        fontSize: 14,
        color: Colors.primary,
    },
    loginError: {
        color: Colors.error,
        fontSize: 12,
        textAlign: 'center',
    },
    loginBtns: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 4,
    },
    loginBtnCancel: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginBtnAccept: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
import { useState, useContext, useEffect, useRef } from 'react'
import {
    TouchableOpacity,
    View,
    StyleSheet,
    TextInput,
    Modal,
    ActivityIndicator
} from 'react-native'
import Text from '@components/Text'
import ScreenContainer from '../components/ScreenContainer'
import Header from '../components/Header'
import SettingsBtn from '../components/SettingsBtn'
import ModalSettingsBtns from '../components/ModalSettingsBtns'
import ModalDelete from '../components/ModalDelete'
import Colors from '../constants/colors'
import { es, en } from '../utils/languages'
import { ExpensiaContext } from '../context/expensiaContext'
import { useAuth } from '../context/authContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const TAPS_REQUIRED = 20
const TAP_RESET_MS = 3000

const SettingsScreen = ({ navigation }) => {
    const { user, editUserLanguage, updateUserName, togglePrivacy, clearTransactions, deleteUser } = useContext(ExpensiaContext)
    const { isLoggedIn, backendUser, login, logout } = useAuth()
    const strings = user && user.language === 'en' ? en : es

    const [modalVisibleLanguage, setModalVisibleLanguage] = useState(false)
    const [modalVisibleEditName, setModalVisibleEditName] = useState(false)
    const [modalVisibleDeleteTransactions, setModalVisibleDeleteTransactions] = useState(false)
    const [modalVisibleDeleteAll, setModalVisibleDeleteAll] = useState(false)
    const [modalVisibleLogout, setModalVisibleLogout] = useState(false)
    const [showLoginModal, setShowLoginModal] = useState(false)

    const [txtName, setTxtName] = useState('')
    const [txtNameEmptyLoad, setTxtNameEmptyLoad] = useState(true)

    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [loginLoading, setLoginLoading] = useState(false)
    const [loginError, setLoginError] = useState(null)

    const tapCount = useRef(0)
    const tapTimer = useRef(null)

    useEffect(() => {
        setTxtName(user?.name ?? '')
    }, [])

    const handleTitlePress = () => {
        clearTimeout(tapTimer.current)
        tapCount.current += 1
        if (tapCount.current >= TAPS_REQUIRED) {
            tapCount.current = 0
            setShowLoginModal(true)
            return
        }
        tapTimer.current = setTimeout(() => { tapCount.current = 0 }, TAP_RESET_MS)
    }

    const handleChangeName = () => {
        if (txtName === '') {
            setTxtNameEmptyLoad(false)
        } else {
            updateUserName(txtName)
            setModalVisibleEditName(false)
        }
    }

    const handleChangeLanguage = (language) => {
        editUserLanguage(language)
        setModalVisibleLanguage(false)
    }

    const handleTogglePrivacy = () => {
        togglePrivacy()
    }

    const handleDeleteTransactions = () => {
        clearTransactions()
        setModalVisibleDeleteTransactions(false)
    }

    const handleDeleteAll = async () => {
        try {
            await deleteUser()
            setModalVisibleDeleteAll(false)
        } catch (error) {
            console.log('Error deleting user:', error)
        }
    }

    const handleLogin = async () => {
        if (!loginEmail || !loginPassword) return
        setLoginLoading(true)
        setLoginError(null)
        try {
            await login(loginEmail, loginPassword)
            setShowLoginModal(false)
            setLoginEmail('')
            setLoginPassword('')
        } catch (e) {
            setLoginError('Correo o contraseña incorrectos')
        } finally {
            setLoginLoading(false)
        }
    }

    const handleLogout = () => {
        setModalVisibleLogout(false)
        logout()
    }

    return (
        <ScreenContainer>
            <Header
                darkText={strings.settingsScreen.headerDarkTxt}
                gradientText={strings.settingsScreen.headerGradientTxt}
                onTitlePress={handleTitlePress}
            />
            <View style={styles.btnsContainer}>
                <SettingsBtn
                    title={strings.settingsScreen.changeLanguage}
                    description={strings.settingsScreen.descriptionLanguage + (user && user.language === 'en' ? 'English' : 'Español')}
                    icon="language"
                    iconColor={Colors.secondary}
                    onPress={() => setModalVisibleLanguage(true)}
                />
                <SettingsBtn
                    title={strings.settingsScreen.editName}
                    description={strings.settingsScreen.descriptionName + (user && user.name)}
                    icon="lead-pencil"
                    iconColor={Colors.secondary}
                    onPress={() => setModalVisibleEditName(true)}
                />
                <SettingsBtn
                    title={strings.settingsScreen.changePrivacy}
                    description={strings.settingsScreen.descriptionPrivacy}
                    icon={user && !user.isPrivacyEnabled ? 'eye' : 'eye-off'}
                    iconColor={Colors.secondary}
                    onPress={handleTogglePrivacy}
                />
                <SettingsBtn
                    title={strings.settingsScreen.customCategories}
                    description={strings.settingsScreen.descriptionCategories}
                    icon="shape-outline"
                    iconColor={Colors.secondary}
                    onPress={() => navigation.navigate('CustomCategories')}
                />
                <SettingsBtn
                    title={strings.settingsScreen.deleteTransactions}
                    description={strings.settingsScreen.descriptionTransactions}
                    icon="trash-can-outline"
                    iconColor={Colors.error}
                    onPress={() => setModalVisibleDeleteTransactions(true)}
                />
                <SettingsBtn
                    title={strings.settingsScreen.deleteAll}
                    description={strings.settingsScreen.descriptionAll}
                    icon="restart-alert"
                    iconColor={Colors.error}
                    onPress={() => setModalVisibleDeleteAll(true)}
                />
                {isLoggedIn && (
                    <SettingsBtn
                        title={strings.settingsScreen.logout}
                        description={`${strings.settingsScreen.logoutSession} ${backendUser?.email ?? ''}`}
                        icon="logout"
                        iconColor={Colors.error}
                        onPress={() => setModalVisibleLogout(true)}
                    />
                )}
            </View>

            {/* Language modal */}
            <ModalSettingsBtns
                modalVisible={modalVisibleLanguage}
                setModalVisible={setModalVisibleLanguage}
                title={strings.settingsScreen.changeLanguage}
                actionAccept={() => setModalVisibleLanguage(false)}
            >
                <TouchableOpacity onPress={() => handleChangeLanguage('en')} style={[styles.containerLanguageTxt, user && user.language === 'en' && styles.containerSelectedLanguageTxt]}>
                    <Text color="primary" style={styles.languageTxt}>English</Text>
                    {user && user.language === 'en' && <MaterialCommunityIcons name="check" size={24} color={Colors.secondary} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleChangeLanguage('es')} style={[styles.containerLanguageTxt, user && user.language === 'es' && styles.containerSelectedLanguageTxt]}>
                    <Text color="primary" style={styles.languageTxt}>Español</Text>
                    {user && user.language === 'es' && <MaterialCommunityIcons name="check" size={24} color={Colors.secondary} />}
                </TouchableOpacity>
            </ModalSettingsBtns>

            {/* Edit name modal */}
            <ModalSettingsBtns
                modalVisible={modalVisibleEditName}
                setModalVisible={setModalVisibleEditName}
                title={strings.settingsScreen.editName}
                actionAccept={handleChangeName}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.txtNameInput, txtNameEmptyLoad ? null : { borderColor: Colors.error, borderWidth: 2 }]}
                        onChangeText={setTxtName}
                        value={txtName}
                        returnKeyType="done"
                        inputMode="text"
                        placeholder="Enter your first name"
                        blurOnSubmit
                        maxLength={18}
                    />
                </View>
            </ModalSettingsBtns>

            <ModalDelete
                modalVisible={modalVisibleDeleteTransactions}
                setModalVisible={setModalVisibleDeleteTransactions}
                title={strings.settingsScreen.deleteTransactions}
                description={strings.settingsScreen.deleteTransactionsModal}
                onPressDelete={handleDeleteTransactions}
            />

            <ModalDelete
                modalVisible={modalVisibleDeleteAll}
                setModalVisible={setModalVisibleDeleteAll}
                title={strings.settingsScreen.deleteAll}
                description={strings.settingsScreen.deleteAllModal}
                onPressDelete={handleDeleteAll}
            />

            <ModalDelete
                modalVisible={modalVisibleLogout}
                setModalVisible={setModalVisibleLogout}
                title={strings.settingsScreen.logoutModalTitle}
                description={strings.settingsScreen.logoutModalDesc}
                onPressDelete={handleLogout}
                confirmButtonLabel={strings.settingsScreen.logout}
            />

            {/* Hidden login modal */}
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
                        {loginError && (
                            <Text style={styles.loginError}>{loginError}</Text>
                        )}
                        <View style={styles.loginBtns}>
                            <TouchableOpacity onPress={() => { setShowLoginModal(false); setLoginError(null) }} style={styles.loginBtnCancel}>
                                <Text color="primary">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleLogin} style={styles.loginBtnAccept} disabled={loginLoading}>
                                {loginLoading
                                    ? <ActivityIndicator size="small" color={Colors.white} />
                                    : <Text style={{ color: Colors.white }} weight="bold">Entrar</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    )
}

export default SettingsScreen

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
        includeFontPadding: false,
    },
    inputContainer: {
        height: 40
    },
    txtNameInput: {
        backgroundColor: Colors.white,
        height: 40,
        flex: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontFamily: 'Poppins-Light',
        fontSize: 15,
        borderWidth: 0.5,
        borderColor: Colors.secondary,
        color: Colors.primary,
    },
    loginOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 24,
        width: '80%',
        gap: 12
    },
    loginTitle: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 4
    },
    loginInput: {
        borderWidth: 0.5,
        borderColor: Colors.secondary,
        borderRadius: 10,
        paddingHorizontal: 14,
        height: 44,
        fontFamily: 'Poppins-Light',
        fontSize: 14,
        color: Colors.primary
    },
    loginError: {
        color: Colors.error,
        fontSize: 12,
        textAlign: 'center'
    },
    loginBtns: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 4
    },
    loginBtnCancel: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginBtnAccept: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

// React / React-Native
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import Text from '@components/Text';
// Utils
import Colors from "../constants/colors";
import formatNumberWithCommas from "../utils/formatNumberWithCommas";
// Icons
import { MaterialIcons } from '@expo/vector-icons';
// Context
import { useContext, useRef, useMemo, useCallback, useEffect, useState } from "react";
import { ExpensiaContext } from "../context/expensiaContext";
// Languages
import { es, en } from "../utils/languages";
import {
    TouchableOpacity as TouchableOpacityMod,
    BottomSheetModal,
    BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import containerComponent from '@utils/bottomSheetContainer'
import { sortAccountsByName } from '../utils/sortAccountsByName'

const ModalSelect = ({ modalVisible, setModalVisible, data, selectedValue, handleSelectedModal }) => {
    const { user } = useContext(ExpensiaContext);
    const strings = user && user.language === "en" ? en : es;
    const modalStrings = strings.modalSelect;

    const [searchQuery, setSearchQuery] = useState('');

    const sortedData = useMemo(() => sortAccountsByName(data ?? []), [data]);

    const manyAccounts = sortedData.length > 5;

    const snapPoints = useMemo(
        () => (manyAccounts ? ['90%'] : ['30%', '60%', '90%']),
        [manyAccounts]
    );

    const initialSnapIndex = manyAccounts ? 0 : 1;

    const filteredAccounts = useMemo(() => {
        if (!manyAccounts) return sortedData;
        const q = searchQuery.trim().toLowerCase();
        if (!q) return sortedData;
        return sortedData.filter((item) =>
            (item.name || '').toLowerCase().includes(q)
        );
    }, [sortedData, manyAccounts, searchQuery]);

    const handleSendSelected = (item) => {
        handleSelectedModal(item)
        setModalVisible(!modalVisible)
    }

    const presentRef = useRef(null);

    const closeModal = useCallback(() => presentRef.current?.close(), []);

    const handleOpenModal = useCallback(() => {
        presentRef.current?.present();
    }, []);

    useEffect(() => {
        if (modalVisible) {
            handleOpenModal()
        } else {
            setSearchQuery('')
            closeModal()
        }
    }, [modalVisible, handleOpenModal, closeModal])

    const selectedId = selectedValue?.id;

    return (
        <BottomSheetModal
            key={manyAccounts ? 'account-sheet-large' : 'account-sheet-default'}
            index={initialSnapIndex}
            ref={presentRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enableDismissOnClose
            containerComponent={containerComponent}
            onDismiss={() => setModalVisible(false)}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
            handleIndicatorStyle={{ backgroundColor: Colors.sheetHandle }}
            handleComponent={() => <View style={{ justifyContent: "center", alignItems: "center" }}>
                <View style={{ width: 40, height: 4, backgroundColor: Colors.sheetHandle, marginTop: 10, borderRadius: 2 }}>
                </View>
            </View>}
            backgroundStyle={{ backgroundColor: Colors.sheetBackground, borderWidth: 1, borderColor: Colors.sheetBorder, borderRadius: 40 }}
        >
            <View style={{ alignItems: "flex-end", width: "95%" }}>
                <TouchableOpacityMod onPress={() => closeModal()} >
                    <MaterialCommunityIcons name="close" size={24} color={Colors.sheetHandle} />
                </TouchableOpacityMod>
            </View>

            <Text weight="bold" color="primary" size="l" style={styles.chooseTxt}>{modalStrings.chooseAccount}</Text>

            {manyAccounts && (
                <View style={styles.searchWrap}>
                    <BottomSheetTextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder={modalStrings.searchPlaceholder}
                        placeholderTextColor={Colors.placeholder}
                        returnKeyType="search"
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    <MaterialIcons name="search" size={22} color={Colors.primary} style={styles.searchIcon} />
                </View>
            )}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {filteredAccounts.length === 0 ? (
                    <Text color="placeholder" size="m" style={styles.noResults}>
                        {modalStrings.noResults}
                    </Text>
                ) : (
                    filteredAccounts.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.rowModule, selectedId === item.id ? styles.rowSelectedModule : null]}
                            onPress={() => handleSendSelected(item)}
                        >
                            <View style={styles.rowLeading}>
                                <MaterialCommunityIcons
                                    name={item.icon || 'bank'}
                                    size={24}
                                    color={Colors.primary}
                                    style={styles.rowAccountIcon}
                                />
                                <View style={styles.rowTextCol}>
                                    <Text weight="bold" color="primary" size="l" numberOfLines={1} ellipsizeMode="tail">
                                        {item.name}
                                    </Text>
                                    <Text color="primary" size="l">${formatNumberWithCommas(item.amount)}</Text>
                                </View>
                            </View>
                            {selectedId === item.id && (
                                <MaterialIcons name="check" size={24} color={Colors.primary} style={styles.checkIcon} />
                            )}
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </BottomSheetModal>
    )
}

export default ModalSelect;

const styles = StyleSheet.create({
    chooseTxt: {
        textAlign: "center",
        paddingHorizontal: 16,
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 4,
        backgroundColor: Colors.white,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.secondary,
        paddingHorizontal: 12,
        height: 42,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Poppins-Light',
        fontSize: 15,
        color: Colors.primary,
        paddingVertical: 8,
        minWidth: 0,
    },
    searchIcon: {
        marginLeft: 8,
    },
    scrollContent: {
        alignItems: 'center',
        marginTop: 16,
        paddingBottom: 24,
    },
    noResults: {
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 24,
    },
    rowModule: {
        flexDirection: "row",
        padding: 10,
        width: '98%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
    },
    rowLeading: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
        marginRight: 8,
    },
    rowAccountIcon: {
        marginRight: 10,
    },
    rowTextCol: {
        flex: 1,
        minWidth: 0,
    },
    checkIcon: {
        flexShrink: 0,
    },
    rowSelectedModule: {
        borderWidth: 0.5,
        borderRadius: 10,
        borderColor: Colors.secondary
    },
    moduleBox: {
        backgroundColor: Colors.light,
        paddingTop: 15,
        width: '100%',
        height: '50%',
        borderRadius: 20,
        justifyContent: 'center'
    },
    mainContainer: {
        backgroundColor: Colors.overlay,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

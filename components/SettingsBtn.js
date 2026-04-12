// React / React-Native
import {
    View,
    TouchableOpacity,
    StyleSheet
} from "react-native";
import Text from '@components/Text';
// Icons
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// Utils
import Colors from "../constants/colors";

const SettingsBtn = ({ title, description, icon, iconColor, onPress }) => {


    return (
        <TouchableOpacity onPress={onPress} style={styles.mainContainer}>
            <View style={styles.containers}>
                <Text weight="bold" color="primary">{title}</Text>
                <Text color="primary">{description}</Text>
            </View>
            <View style={styles.containers}>
                {icon === 'language' ?
                    <Ionicons name="language" size={24} color={iconColor} />
                    :
                    <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
                }
            </View>
        </TouchableOpacity>
    );

}

export default SettingsBtn;

const styles = StyleSheet.create({
    mainContainer: {
        width: "90%",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: "4%",
        paddingVertical: 5,
        paddingHorizontal: 20,
        backgroundColor: Colors.light,
        borderWidth: 1,
        borderRadius: 20,
        borderColor: Colors.white,
        shadowColor: Colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 7.49,

        elevation: 12,
    },
    containers: {

    },
})


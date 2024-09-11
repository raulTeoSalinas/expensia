// React / React-Native
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet
} from "react-native"
// Icons
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// Utils
import Colors from "../utils/colors";

const SettingsBtn = ({ title, description, icon, iconColor, onPress }) => {


    return (
        <TouchableOpacity onPress={onPress} style={styles.mainContainer}>
            <View style={styles.containers}>
                <Text style={styles.txtTitle}>{title}</Text>
                <Text style={styles.txtDescription}>{description}</Text>
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
        borderColor: 'white',
        shadowColor: "#000",
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
    txtTitle: {
        fontFamily: 'Poppins-SemiBold',
        color: Colors.primary
    },
    txtDescription: {
        fontFamily: 'Poppins-Light',
        color: Colors.primary
    }
})


// React / React-Native
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Platform
} from 'react-native';
import Text from '@components/Text';
// Navigation
import { useNavigation } from "@react-navigation/native";
// Components
import GradientText from './TextGradient';
// Utils
import Colors from '../constants/colors';


const Header = ({ darkText, gradientText, addBtn, onTitlePress }) => {

    const navigation = useNavigation();

    const handleFloatBtnNavigate = () => {
        navigation.navigate("TypeTransaction")
    }

    return (
        <View style={styles.welcomeContainer}>
            <TouchableOpacity activeOpacity={1} onPress={onTitlePress} disabled={!onTitlePress} style={styles.rowContainer}>
                <Text weight="bold" color="primary" style={styles.welcome}>{darkText}</Text>
                <GradientText weight="bold" style={styles.welcome}>{gradientText}</GradientText>
            </TouchableOpacity>
            {addBtn &&
                <TouchableOpacity style={styles.opacity} onPress={handleFloatBtnNavigate} >
                    <Image style={styles.buttonIcon} source={require('../assets/images/icon-plus.png')} />
                </TouchableOpacity>
            }
        </View>
    );

}
export default Header;

const styles = StyleSheet.create({
    welcome: {
        fontSize: 25,
    },
    buttonIcon: {
        resizeMode: 'contain',
        width: 50,
        height: 50,
    },
    opacity: {
        width: 60,
        height: 60,
    },
    welcomeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: '8%',
        marginRight: '2%',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? "2%" : '10%',
        height: 90
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: 'center'
    }
});
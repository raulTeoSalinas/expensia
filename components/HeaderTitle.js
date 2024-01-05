// React / React-Native
import {
    Text,
    StyleSheet
} from "react-native";
// Components
import GradientText from "./TextGradient";
// Utils
import Colors from "../utils/colors";

const HeaderTitle = ({title, children}) => {

    return (
        <>
            <Text style={styles.txt}>
                {title}
            </Text>
            <GradientText style={styles.gradientTxt}>
                {children}
            </GradientText>
        </>
    );
}
export default HeaderTitle;

const styles = StyleSheet.create({
    txt: {
        fontFamily: 'poppins-bold', 
        fontSize: 20, 
        color: Colors.primary 
    },
    gradientTxt: {
        fontFamily: 'poppins-bold', 
        fontSize: 20 
    }
});
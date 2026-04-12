// React / React-Native
import { StyleSheet } from "react-native";
import Text from '@components/Text';
// Components
import GradientText from "./TextGradient";
// Utils
import Colors from "../constants/colors";

const HeaderTitle = ({ title, children }) => {

    return (
        <>
            <Text weight="bold" color="primary" style={styles.txt}>
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
        fontSize: 20,
    },
    gradientTxt: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 20
    }
});
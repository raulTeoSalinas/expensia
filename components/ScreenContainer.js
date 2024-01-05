// React / React-Native
import { 
    SafeAreaView, 
    ScrollView, 
    StyleSheet 
} from "react-native"
// Utils
import Colors from "../utils/colors";

const ScreenContainer = ({children}) => {

    return (
        <SafeAreaView style={styles.mainContainer}>
            <ScrollView>
                {children}
            </ScrollView>
        </SafeAreaView>
    )
}

export default ScreenContainer;

const styles = StyleSheet.create({
    mainContainer: {
		flex: 1,
		backgroundColor: Colors.light,
	}
});
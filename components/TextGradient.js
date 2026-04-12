// React / React-Native
import { Text as RNText } from "react-native";
// Third Party Libraries
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
// Components
import { resolveTextTypography } from "./Text";
// Utils
import Colors from "../constants/colors";

/**
 * Texto con gradiente; tamaño y peso como Text (el color lo define el gradiente).
 * @param {'xs'|'s'|'m'|'l'|'xl'} [size='m']
 * @param {'normal'|'bold'} [weight='normal']
 */
const GradientText = ({
  size = "m",
  weight = "normal",
  children,
  style,
  ...rest
}) => {
  const { fontSize, fontFamily } = resolveTextTypography({ size, weight });
  const textStyle = [{ fontSize, fontFamily, color: Colors.black }, style];

  return (
    <MaskedView maskElement={<RNText {...rest} style={textStyle}>{children}</RNText>}>
      <LinearGradient colors={[Colors.secondary, Colors.accent]}>
        <RNText {...rest} style={[...textStyle, { opacity: 0 }]}>
          {children}
        </RNText>
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;
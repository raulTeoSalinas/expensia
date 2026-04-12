// React / React-Native
import { Text as RNText } from 'react-native';
// Constants
import Colors from '../constants/colors';

const FONT_SIZES = {
    xs: 10,
    s: 12,
    m: 14,
    l: 18,
    xl: 26,
};

const TEXT_COLOR_KEYS = ['black', 'white', 'primary', 'secondary', 'accent', 'error', 'placeholder', 'light'];

const FONT_WEIGHT = {
    normal: 'Poppins-Light',
    bold: 'Poppins-SemiBold',
};

/** @param {{ size?: string, color?: string, weight?: string }} p */
export const resolveTextTypography = ({ size = 'm', color = 'black', weight = 'normal' } = {}) => {
    const fontSize = FONT_SIZES[size] ?? FONT_SIZES.m;
    const resolvedColor = TEXT_COLOR_KEYS.includes(color) ? Colors[color] : Colors.black;
    const fontFamily = FONT_WEIGHT[weight] ?? FONT_WEIGHT.normal;
    return { fontSize, color: resolvedColor, fontFamily };
};

/**
 * Texto tipográfico unificado (tamaño + color desde la paleta).
 * @param {'xs'|'s'|'m'|'l'|'xl'} [size='m']
 * @param {'black'|'white'|'primary'|'secondary'|'accent'|'error'|'placeholder'|'light'} [color='black']
 * @param {'normal'|'bold'} [weight='normal']
 */
const Text = ({ size = 'm', color = 'black', weight = 'normal', children, style, ...rest }) => {
    const { fontSize, color: resolvedColor, fontFamily } = resolveTextTypography({
        size,
        color,
        weight,
    });

    return (
        <RNText
            style={[{ fontSize, color: resolvedColor, fontFamily }, style]}
            {...rest}
        >
            {children}
        </RNText>
    );
};

export default Text;


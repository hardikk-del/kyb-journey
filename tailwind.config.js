/** @type {import('tailwindcss').Config} */
// Cashfree design tokens — RM-Led Bank Onboarding flow.
// Brand hue electric blue #094EFF; greys + status greens/reds/ambers from the
// Cashfree payments semantic system. 4px grid.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // App is light-only (userInterfaceStyle: "light"). The default darkMode
  // 'media' makes react-native-css-interop's web MutationObserver throw when it
  // tries to set the color scheme; 'class' silences that without adding a theme.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blue: {
          50: 'rgb(229, 237, 255)',
          100: 'rgb(204, 218, 255)',
          200: 'rgb(158, 185, 255)',
          300: 'rgb(107, 149, 255)',
          400: 'rgb(56, 112, 255)',
          500: 'rgb(9, 78, 255)',
          600: 'rgb(0, 59, 209)',
          700: 'rgb(0, 44, 158)',
          800: 'rgb(0, 30, 107)',
          900: 'rgb(0, 14, 51)',
        },
        grey: {
          50: 'rgb(250, 250, 250)',
          100: 'rgb(247, 247, 247)',
          150: 'rgb(242, 242, 242)',
          200: 'rgb(232, 232, 232)',
          250: 'rgb(224, 224, 224)',
          300: 'rgb(209, 209, 209)',
          400: 'rgb(164, 164, 164)',
          500: 'rgb(141, 141, 141)',
          600: 'rgb(118, 118, 118)',
          700: 'rgb(95, 95, 95)',
          800: 'rgb(73, 73, 73)',
          900: 'rgb(49, 49, 49)',
          950: 'rgb(27, 27, 27)',
        },
        green: {
          50: 'rgb(220, 255, 233)',
          100: 'rgb(137, 242, 175)',
          300: 'rgb(74, 199, 127)',
          400: 'rgb(4, 171, 97)',
          500: 'rgb(0, 155, 84)',
          600: 'rgb(0, 134, 65)',
          700: 'rgb(0, 112, 48)',
        },
        red: {
          50: 'rgb(255, 224, 224)',
          200: 'rgb(255, 122, 122)',
          500: 'rgb(184, 0, 0)',
          600: 'rgb(148, 0, 0)',
        },
        amber: {
          50: 'rgb(255, 247, 230)',
          300: 'rgb(253, 207, 115)',
          500: 'rgb(251, 176, 22)',
          700: 'rgb(173, 117, 0)',
        },
        // semantic
        ink: 'rgb(27, 27, 27)',
        'ink-2': 'rgb(73, 73, 73)',
        'ink-3': 'rgb(118, 118, 118)',
        placeholder: 'rgb(141, 141, 141)',
        page: 'rgb(244, 246, 249)',
        card: 'rgb(255, 255, 255)',
        line: 'rgb(232, 232, 232)',
        'line-strong': 'rgb(209, 209, 209)',
        brand: 'rgb(9, 78, 255)',
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '14px',
        '2xl': '16px',
        full: '360px',
      },
      fontFamily: {
        sans: ['DMSans_400Regular'],
        medium: ['DMSans_500Medium'],
        semibold: ['DMSans_600SemiBold'],
        bold: ['DMSans_700Bold'],
        mono: ['DMMono_400Regular'],
      },
    },
  },
  plugins: [],
};

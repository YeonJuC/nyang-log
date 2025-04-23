module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        jua: ["'Jua'", "sans-serif"],
        gowun: ["'Gowun Dodum'", "sans-serif"],
        apple: ['AppleSDGothicNeoL00', 'sans-serif'],
        apple_bold: ['AppleSDGothicNeoB00', 'sans-serif'],
        apple_semibold: ['AppleSDGothicNeoR00', 'sans-serif'],
        apple_bigbold: ['AppleSDGothicNeoEB00', 'sans-serif'],
        apple_sobigbold: ['AppleSDGothicNeoH00', 'sans-serif']
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        'top': '0 -4px 10px rgba(0, 0, 0, 0.1)', // 🎯 상단 그림자
      },
    },
  },
  plugins: [],
};





module.exports = {
  purge: [
    "./hooks/**/*.{js,jsx,ts,tsx,module.css}",
    "./pages/**/*.{js,jsx,ts,tsx,module.css}",
    "./layouts/**/*.{js,jsx,ts,tsx,module.css}",
    "./components/**/*.{js,jsx,ts,tsx,module.css}",
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        104: "26rem",
        112: "28rem",
        120: "30rem",
        128: "32rem",
        136: "34rem",
        152: "38rem",
        160: "40rem",
        168: "42rem",
        192: "48rem",
        224: "56rem",
        256: "64rem",
        288: "72rem",
      },
      minWidth: {
        xs: "20rem",
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
        "3xl": "48rem",
        "4xl": "56rem",
        "5xl": "64rem",
        "6xl": "72rem",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

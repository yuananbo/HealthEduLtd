/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        greenPrimary: "#06a9b1",
        hoverColor: "#008b95",
        blueColor: "#f29623",
        blueHover: "#f29635",
      },
      lineClamp: {
        3: "3",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};

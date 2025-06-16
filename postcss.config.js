const tailwindcss = require('@tailwindcss/postcss')()

module.exports = {
  plugins: {
    [tailwindcss.name]: tailwindcss, // Ini wajib pakai sintaks ini di Tailwind v4
    autoprefixer: {},
  },
}

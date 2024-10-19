/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  semi: true,             // Add semicolons at the end of statements
  singleQuote: true,       // Use single quotes instead of double quotes
  trailingComma: "es5",    // Add trailing commas where valid in ES5 (objects, arrays, etc.)
  tabWidth: 2,             // Set the number of spaces per indentation level
  printWidth: 80,          // Set the maximum line length
};

export default config;

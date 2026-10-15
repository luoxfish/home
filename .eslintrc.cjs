module.exports = {
  root: true,
  env: { browser: true, node: true, es2022: true },
  extends: ["eslint:recommended", "plugin:vue/vue3-essential"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  globals: Object.fromEntries(
    [
      "ref",
      "reactive",
      "computed",
      "watch",
      "watchEffect",
      "nextTick",
      "h",
      "onMounted",
      "onBeforeUnmount",
      "defineAsyncComponent",
      "ElMessage",
      "defineProps",
      "defineEmits",
      "defineExpose",
    ].map((name) => [name, "readonly"]),
  ),
  ignorePatterns: ["dist/", "node_modules/", ".work/", "*.d.ts"],
  rules: {
    "vue/multi-word-component-names": "off",
    "no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
    ],
  },
};

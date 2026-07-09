/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-idiomatic-order"],
  plugins: ["stylelint-prettier"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "apply",
          "config",
          "custom-media",
          "layer",
          "reference",
          "responsive",
          "screen",
          "source",
          "theme",
          "utility",
          "variants",
        ],
      },
    ],
    "declaration-block-no-redundant-longhand-properties": [
      true,
      {
        ignoreShorthands: ["/flex/"],
      },
    ],
    "declaration-property-value-no-unknown": true,
    "display-notation": "short",
    "no-descending-specificity": null,
    "prettier/prettier": true,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global"],
      },
    ],
  },
};

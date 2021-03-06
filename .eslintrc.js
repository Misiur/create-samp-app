module.exports = {
    "extends": "airbnb-base",
    "env": {
      "node": true,
    },
    "rules": {
      "no-plusplus": "off",
      "comma-dangle": ["error", {
          "arrays": "always-multiline",
          "objects": "always-multiline",
          "imports": "always-multiline",
          "exports": "always-multiline",
          "functions": "ignore"
      }],
    },
};

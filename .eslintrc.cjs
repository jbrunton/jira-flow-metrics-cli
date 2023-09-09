module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:boundaries/strict",
    "prettier",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "boundaries"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "boundaries/element-types": [
      2,
      {
        default: "disallow",
        rules: [
          {
            from: "entities",
            allow: ["entities"],
          },
          {
            from: "usecases",
            allow: ["entities", "usecases"],
          },
          {
            from: "data",
            allow: ["entities", "data"],
          },
          {
            from: "app",
            allow: ["entities", "data", "usecases", "app"],
          },
          {
            from: "main",
            allow: ["app", "data", "main"],
          },
        ],
      },
    ],
    "boundaries/external": [
      2,
      {
        default: "disallow",
        rules: [
          {
            from: ["app", "main"],
            allow: ["*", "*/*"],
          },
          {
            from: ["data"],
            allow: [
              "lowdb",
              "@nestjs/common",
              "jira.js",
              "node:path",
              "node:url",
              "node:crypto",
            ],
          },
          {
            from: ["*"],
            // TODO: remove jira.js from this
            allow: [
              "rambda",
              "lodash",
              "async",
              "date-fns",
              "jira.js",
              "mathjs",
            ],
          },
        ],
      },
    ],
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    "boundaries/ignore": [".eslintrc.cjs"],
    "boundaries/elements": [
      {
        type: "entities",
        pattern: "src/domain/entities",
      },
      {
        type: "usecases",
        pattern: "src/domain/usecases",
      },
      {
        type: "data",
        pattern: "src/data",
      },
      {
        type: "app",
        pattern: "src/app",
      },
      {
        type: "main",
        pattern: ["src/main.mts"],
        mode: "file",
      },
    ],
  },
};

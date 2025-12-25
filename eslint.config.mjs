import type { Config } from "eslint"

const config: Config = {
  extends: ["next"],
  rules: {
    "react/no-unescaped-entities": "off",
    "@next/next/no-html-link-for-pages": "off",
  },
}

export default config

import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import filesize from "rollup-plugin-filesize";
import commonjs from "@rollup/plugin-commonjs";
import minifyHTML from "rollup-plugin-minify-html-literals";
import json from "rollup-plugin-json";

export default {
  input: "src/index.js",
  output: {
    file: "advanced-glance-card.js",
    format: "umd",
    name: "AdvancedGlanceCard"
  },
  plugins: [resolve(), json(), commonjs(), minifyHTML(), terser(), filesize()]
};

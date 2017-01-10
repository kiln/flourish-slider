var nodeResolve = require("rollup-plugin-node-resolve");

export default {
  entry: "src/slider.js",
  format: "umd",
  moduleName: "slider",
  dest: "slider.js",

  plugins: [
    nodeResolve({jsnext: true})
  ]
};

var nodeResolve = require("rollup-plugin-node-resolve");

export default {
  entry: "src/index.js",
  format: "umd",
  moduleName: "Slider",
  dest: "slider-full.js",

  plugins: [
    nodeResolve({jsnext: true})
  ]
};

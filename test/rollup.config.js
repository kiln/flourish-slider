var nodeResolve = require("rollup-plugin-node-resolve");

export default {
  entry: "src/slider.js",
  format: "iife",
  dest: "slider.js",
  sourceMap: true,

  plugins: [
    nodeResolve({ jsnext: true, module: true, main: false })
  ]
};

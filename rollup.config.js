var nodeResolve = require("rollup-plugin-node-resolve");

export default {
  entry: "src/slider.js",
  format: "umd",
  moduleName: "Slider",
  dest: "slider.js",

  external: [ "d3" ],
  globals: { d3: "d3" },

  plugins: [
    nodeResolve({jsnext: true})
  ]
};

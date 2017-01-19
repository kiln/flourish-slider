var nodeResolve = require("rollup-plugin-node-resolve");

export default {
  entry: "src/slider.js",
  format: "umd",
  moduleName: "Slider",
  dest: "slider.js",

  external: [ "d3-selection", "d3-axis", "d3-scale" ],
  globals: { "d3-selection": "d3", "d3-axis": "d3", "d3-scale": "d3" },

  plugins: [
    nodeResolve({jsnext: true})
  ]
};

var nodeResolve = require("rollup-plugin-node-resolve"),
    fs = require("fs"),
    path = require("path");

export default {
  entry: "component_test/slider.js",
  format: "iife",
  dest: "../site/component_test/slider.js",
  sourceMap: true,

  external: [ path.resolve("./d3/index.js") ],
  globals: { [path.resolve("./d3/index.js")]: "_d3" },
  banner: fs.readFileSync("d3/build/_d3.min.js"),

  // d3 relies on the node-resolve plugin
  plugins: [
    nodeResolve({jsnext: true})
  ]
};

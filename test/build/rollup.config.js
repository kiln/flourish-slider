import path from "path";
import nodeResolve from "rollup-plugin-node-resolve";

const slider_path = path.resolve("../../src/slider.js");

export default {
	input: "../src/tests.js",
	output: {
		format: "iife",
		file: "test.js",
		sourceMap: true,
		globals: { [slider_path]: "Slider", "d3": "d3" },
	},

	external: [ slider_path, "d3" ],

	plugins: [
		nodeResolve({ jsnext: true, module: true, main: false })
	]
};

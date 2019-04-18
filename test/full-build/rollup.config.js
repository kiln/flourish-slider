import path from "path";
import nodeResolve from "rollup-plugin-node-resolve";

const slider_path = path.resolve("../../src/slider.js");

export default {
	input: "../src/tests.js",
	output: {
		format: "iife",
		file: "test.js",
		sourceMap: true,
		globals: { [slider_path]: "Slider" },
	},

	external: [ slider_path ],

	plugins: [
		nodeResolve({ jsnext: true, module: true, main: false })
	]
};

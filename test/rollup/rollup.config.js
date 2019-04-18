import nodeResolve from "rollup-plugin-node-resolve";

export default {
	input: "../src/tests.js",
	output: {
		format: "iife",
		file: "test.js",
		sourceMap: true,
	},

	plugins: [
		nodeResolve({ jsnext: true, module: true, main: false })
	]
};

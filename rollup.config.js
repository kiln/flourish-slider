import path from "path";
import nodeResolve from "rollup-plugin-node-resolve";

// See the comment in src/slider.js
const d3_scale_linear = path.resolve("./node_modules/d3-scale/src/linear.js");

export default {
	input: "src/slider.js",
	output: {
		format: "umd",
		name: "Slider",
		file: "slider.js",
		globals: { "d3-selection": "d3", "d3-axis": "d3", [d3_scale_linear]: "d3.scaleLinear" },
	},

	external: [ "d3-selection", "d3-axis", "d3-scale", d3_scale_linear ],

	plugins: [
		nodeResolve({jsnext: true})
	]
};

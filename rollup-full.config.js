import nodeResolve from "rollup-plugin-node-resolve";

export default {
	input: "src/slider.js",
	output: {
		format: "umd",
		name: "Slider",
		file: "slider-full.js",
	},

	plugins: [
		nodeResolve({jsnext: true})
	]
};

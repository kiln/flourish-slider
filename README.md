# Flourish slider component

The Slider component provides a highly configurable slider control.
We developed it for use in [Flourish](https://flourish.studio/) templates,
but it’s open source and you can use it for anything.

```import Slider from "@flourish/slider";

var slider = Slider("#year-slider")
	.domain([2000, 2017])
	.startLabel("2000").endLabel("2017")
	.snap(true)
	.onChange(function(year) {
		console.log("Year set to", year);
	})
	.draw();
```

It’s developed as an ES6 module, and you can use it with [rollup.js](http://rollupjs.org/)
and [rollup-plugin-node-resolve](https://github.com/rollup/rollup-plugin-node-resolve),
or another ES6-compatible module bundler. Or you can include the file directly from the web:

```
<script src="https://cdn.flourish.rocks/slider-v1.full.min.js"></script>
```

Slider uses [D3](https://d3js.org/). If you’re already using d3 on your site then you can
include a much smaller file that uses the `d3` object you already have rather than including
D3 code in the file.

```
<script src="https://cdn.flourish.rocks/slider-v1.min.js"></script>
```

If you’re not using D3 for other purposes, it’s more efficient to use the `-full` bundle,
which is built using rollup to only include the elements of D3 that it actually uses.


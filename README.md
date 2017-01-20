# Flourish slider component

The Slider component provides a highly configurable slider control.
We developed it for use in [Flourish](https://flourish.studio/) templates,
but it’s open source and you can use it for anything.

```js
import Slider from "@flourish/slider";

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

```html
<script src="https://cdn.flourish.rocks/slider-v1.full.min.js"></script>
```

Slider uses [D3](https://d3js.org/). If you’re already using D3 on your page then you can
include a much smaller file that uses the `d3` object you already have rather than including
D3 code in the file.

```html
<script src="https://cdn.flourish.rocks/slider-v1.min.js"></script>
```

If you’re not using D3 for other purposes, it’s more efficient to use the `-full` bundle,
because it’s built using rollup to only include the elements of D3 that it actually uses.

# Using Slider in a Flourish template

The typical way to use Slider in a Flourish template is to create a module-level variable
in your template source for each slider you use, and a state property for its value:
```js
var year_slider;
export var state = {
	…
	year: 2000
};
```

## In the `draw()` function

Create the slider, set its value from the state, and draw it:
```js
slider = Slider("#slider")
	.domain([2000, 2017])
	.startLabel("2000").endLabel("2017")
	.snap(true)
	.value(state.year)
	.on("change", function(year) {
		// If the user drags the slider, update the state and the graphic
		state.year = year;
		update();
	})
	.draw();
```

## In the `update()` function

Update the slider from the state:
```js
slider.value(state.year).update();
```

That’s it! If you follow this model, your slider will work correctly in both
the visualisation editor and the story editor.

# Full reference

* [Constructor](#constructor)
* [Methods](#methods)
	* [`.draw()`](#draw)
	* [`.update()`](#update)
	* [`.value()`](#value)
* [Events](#events)
	* [The `change` event](#change)
* [Settings](#settings)
	* [Core settings](#core-settings)
		* [`domain`](#domain)
		* [`snap`](#snap)
		* [`width`](#width)
		* [`height`](#height)
	* [Style settings](#style-settings)
		* [`margin`](#margin)
		* [`handleRadius`](#handleradius)
		* [`handleFill`](#handlefill)
		* [`channelHeight`](#channelheight)
		* [`channelRadius`](#channelradius)
		* [`channelFill`](#channelfill)
	* [Axis settings](#axis-settings)
		* [`axis`](#axis)
		* [`scale`](#scale)
		* [`ticks`](#ticks)
		* [`tickFormat`](#tickformat)
		* [`tickSize`](#ticksize)
	* [Label settings](#label-settings)
		* [`label`](#label)
		* [`labelSize`](#labelsize)
		* [`startLabel`](#startlabel)
		* [`startLabelBelow`](#startlabelbelow)
		* [`endLabel`](#endlabel)
		* [`endLabelBelow`](#endlabelbelow)
		* [`startEndLabelSize`](#startendlabelsize)

## Constructor

`Slider(selector)` creates a slider that will draw into the DOM element
specified by `selector`. This can be an HTML element or an SVG `<g>`.

## Methods

### `.draw()`

Draw the slider.

### `.update()`

Update the slider based on [settings](#settings) you’ve changed. If the slider hasn’t been
drawn yet then calling `.update()` will draw it.

### `.value()`

Retrieves the current position of the slider, in units determined by the [domain](#domain).

### `.value(value)`

Sets the position of the slider. The graphic will not update till you call [`.update()`](#update),
so to move the slider to position 12 you call `slider.value(12).update()`.

### `.on(event, handler)`

Attach an event handler. The only supported event is [`change`](#change). You can attach
multiple handlers for the same event, and all of them will fire when appropriate.

## Events

### `change`

The change event fires when the user moves the slider by dragging the handle or
clicking in the channel. The event handler is passed the new value of the slider
as an argument, and its `this` object is the Slider instance.

## Settings

Settings are applied by calling the method of the same name on the Slider object
with the new value as an argument. These methods return the Slider object, so you
can chain them. For example, you can set the dimensions to 200×50 with
```js
slider.width(200).height(50);
```

You can retrieve the current value of a setting by calling the method with no
arguments, e.g. ```
var handle_radius = slider.handleRadius();
```

### Core settings
#### `domain`
An array of two numbers specifying the range of values the slider can take.
Defaults to `[0, 1]`.

#### `snap`
If `true`, snap to the nearest whole number. If a sorted array, snap to
the nearest value in the array. Defaults to `false`, which gives a continuous
slider.


#### `width`
The width of the slider element. If this is not specified, the
slider fills the whole container.

If the slider element is not rendered at the time the slider is
drawn, for example if it is styled `display: none`, then the
width and height *must* be specified

### `height`
The height of the slider element. Should be supplied if and only if
`width` is also supplied.

### Style settings
#### `margin`
This should be an object with properties `top`, `left`, and `right`.
If any of these properties is omitted or null, the library will try
to choose a sensible margin based on the other parameters. (It doesn’t
always get this right if you’re using start and end labels.)

Defaults to `{ top: null, left: null, right: null }`.

#### `handleRadius`
The radius of the circular slider handle. Defaults to 15 if not supplied.

#### `handleFill`
The color of the handle. Defaults to `black`. The handle can also be styled in CSS
using the `.slider-handle` class.

#### `channelHeight`
The height of the slider channel. Defaults to 15 if not supplied.

#### `channelRadius`
The radius of the corners of the channel. If it’s null then the channel is
a rectangle without rounded corners. Defaults to null.

#### `channelFill`
The color of the channel. Defaults to `#eee`. The channel also be styled in CSS
using the `.slider-channel` class.


### Axis options
#### `axis`
If `true`, show an axis below the slider. If a [`d3-axis`](https://github.com/d3/d3-axis) object, use that
to define the axis. Defaults to `false`, which means no axis.

The next few options affect only the axis:

#### `scale`

#### `ticks`

#### `tickFormat`

#### `tickSize`

These correspond to the options of the same names in [`d3-axis`](https://github.com/d3/d3-axis).
They’re only really useful in conjunction with `.axis(true)`: if you’re constructing your own
axis object, you can set these options directly on the axis object before you pass it to Slider.

### Label options
#### `label`

Label text to draw above the slider. Defaults to null, which means no label.

#### `labelSize`

Font size for label. Defaults to 18. The label can also be styled in CSS using the `.slider-label` class.

#### `startLabel`

Text to draw to the left of the slider. Defaults to null. You’ll probably need to adjust the margins to make room for this label.

#### `startLabelBelow`

Whether to draw the start label below the slider. Defaults to `false`, which draws it to the left.

#### `endLabel`

Text to draw to the right of the slider. Defaults to null. You’ll probably need to adjust the margins to make room for this label.

#### `endLabelBelow`

Whether to draw the end label below the slider. Defaults to `false`, which draws it to the right.

#### `startEndLabelSize`

Font size for start and end labels. Defaults to 16. The start and end labels can also be styled in CSS
using the `.slider-end-labels` class.

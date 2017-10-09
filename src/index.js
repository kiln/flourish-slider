import { select as d3_select } from "d3-selection";

import Slider_draw from "./draw";
import VERSION from "./version";

var OPTIONS = {
	width: null,
	height: null,

	handleRadius: 15,
	channelHeight: 5,
	channelRadius: null,

	handleFill: "black",
	channelFill: "#eee",

	margin: { top: null, left: null, right: null },

	domain: [0,1],
	value: null,
	snap: false,

	scale: null,
	axis: false,
	ticks: null,
	tickFormat: null,
	tickSize: null,

	label: null,
	labelSize: 18,

	startLabel: null,
	startLabelBelow: false,

	endLabel: null,
	endLabelBelow: false,

	startEndLabelSize: 16,

};

function Slider(selector) {
	this.container = d3_select(selector);

	for (var k in OPTIONS) this["_" + k] = OPTIONS[k];

	this.handlers = { "change": [] };
}

// Create accessor methods for all the _parameters defined by the constructor
function accessor(k) {
	Slider.prototype[k] = function(v) {
		if (typeof v == "undefined") return this["_" + k];
		this["_" + k] = v;
		return this;
	};
}
for (var k in OPTIONS) accessor(k);

// Special accessor function for margin
Slider.prototype.margin = function Slider_margin(options) {
	if (!options) return this._margin;

	this._margin = { top: this._margin.top, left: this._margin.left, right: this._margin.right };
	for (k in options) {
		if (k in this._margin) this._margin[k] = options[k];
		else throw "Slider.margin: unrecognised option " + k;
	}
	return this;
};

// Attach event handlers
Slider.prototype.on = function Slider_on(event, handler) {
	if (!(event in this.handlers)) throw "Slider.on: No such event: " + event;
	this.handlers[event].push(handler);
	return this;
};

// Fire event
Slider.prototype.fire = function Slider_fire(event, d) {
	if (!(event in this.handlers)) throw "Slider.fire: No such event: " + event;
	var handlers = this.handlers[event];
	for (var i = 0; i < handlers.length; i++) {
		handlers[i].call(this, d);
	}
	return this;
};

// Draw or update the slider
Slider.prototype.draw = Slider_draw;
Slider.prototype.update = Slider_draw;

function Flourish_slider(selector) {
	return new Slider(selector);
}
Flourish_slider.version = VERSION;

export default Flourish_slider;

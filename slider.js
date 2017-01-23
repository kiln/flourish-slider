(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('d3-selection'), require('d3-axis'), require('../node_modules/d3-scale/src/linear.js')) :
	typeof define === 'function' && define.amd ? define(['d3-selection', 'd3-axis', '../node_modules/d3-scale/src/linear.js'], factory) :
	(global.Slider = factory(global.d3,global.d3,global.d3.scaleLinear));
}(this, (function (d3Selection,d3Axis,d3_scaleLinear) { 'use strict';

d3_scaleLinear = 'default' in d3_scaleLinear ? d3_scaleLinear['default'] : d3_scaleLinear;

// We’re importing from an individual file rather than the top level of the d3-scale
// module to work around a tree-shaking issue that otherwise causes a lot of irrelevant
// d3-scale code to be pulled into the “full” build. See issues:
//
// https://github.com/rollup/rollup/issues/305
// https://github.com/rollup/rollup/issues/1208
//
// There are some associated shenanigans in rollup.config.js to accommodate this.
//
// If and when rollup manages to avoid this problem, we can revert back to the
// straightforward approach.
var VERSION = "1.2.1";

function Slider(selector) {
	this.container = d3Selection.select(selector);

	this._width = null;
	this._height = null;

	this._handleRadius = 15;
	this._channelHeight = 5;
	this._channelRadius = null;

	this._handleFill = "black";
	this._channelFill = "#eee";

	this._margin = { top: null, left: null, right: null };

	this._domain = [0,1];
	this._value = null;
	this._snap = false;

	this._scale = null;
	this._axis = false;
	this._ticks = null;
	this._tickFormat = null;
	this._tickSize = null;

	this._label = null;
	this._labelSize = 18;

	this._startLabel = null;
	this._startLabelBelow = false;

	this._endLabel = null;
	this._endLabelBelow = false;

	this._startEndLabelSize = 16;

	this.handlers = { "change": [] };
}

// Create accessor methods for all the _parameters defined by the constructor
function accessor(k) {
	if (k.length > 0 && k.charAt(0) == "_") {
		Slider.prototype[k.substr(1)] = function(v) {
			if (typeof v == "undefined") return this[k];
			this[k] = v;
			return this;
		};
	}
}
var s = new Slider();
for (var k in s) {
	accessor(k);
}

// Special accessor function for margin
Slider.prototype.margin = function Slider_margin(options) {
	if (!options) return this._margin;
	for (k in options) {
		if (k in this._margin) this._margin[k] = options[k];
		else throw "Kiln.slider.margin: unrecognised option " + k;
	}
	return this;
};

// Attach event handlers
Slider.prototype.on = function Slider_on(event$$1, handler) {
	if (!(event$$1 in this.handlers)) throw "Kiln.slider.on: No such event: " + event$$1;
	this.handlers[event$$1].push(handler);
	return this;
};

// Fire event
Slider.prototype.fire = function Slider_fire(event$$1, d) {
	if (!(event$$1 in this.handlers)) throw "Kiln.slider.fire: No such event: " + event$$1;
	var handlers = this.handlers[event$$1];
	for (var i = 0; i < handlers.length; i++) {
		handlers[i].call(this, d);
	}
	return this;
};

// Binary search
function closestValue(sorted_list, value, a, b) {
	if (typeof a === "undefined") a = 0;
	if (typeof b === "undefined") b = sorted_list.length;

	if (b-a == 0) return value;
	if (b-a == 1) return sorted_list[a];
	if (b-a == 2) {
		var d1 = Math.abs(sorted_list[a] - value),
		    d2 = Math.abs(sorted_list[a+1] - value);
		if (d1 <= d2) return sorted_list[a];
		else return sorted_list[a+1];
	}

	var mid = a + Math.floor((b-a) / 2),
	    mid_v = sorted_list[mid];
	    pre = mid - 1,
	    pre_v = sorted_list[pre];
	if (pre_v <= value && value <= mid_v) {
		return (Math.abs(pre_v - value) <= Math.abs(mid_v - value)) ? pre_v : mid_v;
	}
	if (mid_v <= value) return closestValue(sorted_list, value, mid, b);
	else return closestValue(sorted_list, value, a, mid);
}

function snapTo(specification, value) {
	if (typeof specification == "boolean") {
		return specification ? Math.round(value) : value;
	}
	// Otherwise assume “specification” is a sorted array
	return closestValue(specification, value);
}

// Draw or update the slider
Slider.prototype.draw = function Slider_draw() {
	var that = this;

	var cw = this._width,
	    ch = this._height;

	var container_node = this.container.node();

	// If the width and height have not been specified, use
	// the client size of the container element.
	if (!cw) {
		var r = container_node.getBoundingClientRect();
		// If there isn’t a bounding client rect, e.g. because
		// the container is display: none;, then do nothing.
		if (!r || r.width == 0) return this;

		cw = r.width;
		ch = r.height;
	}

	var channel_r = this._channelRadius == null ? this._channelHeight/2 : this._channelRadius,
	    left_margin = (this._margin.left == null ? Math.max(this._handleRadius, channel_r) : this._margin.left),
	    right_margin = (this._margin.right == null ? Math.max(this._handleRadius, channel_r) : this._margin.right),
	    top_margin = this._margin.top == null ? Math.max(this._handleRadius, this._channelHeight/2) : this._margin.top,
	    w = cw - left_margin - right_margin, // Inner width of the slider channel (excluding endcaps)
	    channel_w = w + 2*channel_r, // Width of the slider channel (including endcaps)
	    label_h = this._labelSize * 1.5;

	if (this._label != null && this._margin.top == null) top_margin += label_h;

	var slider;
	if (container_node.namespaceURI == "http://www.w3.org/2000/svg") {
		slider = this.container;
	}
	else {
		slider = this.container.selectAll("svg").data([{ width: cw, height: ch }]);
		slider.exit().remove();
		slider = slider.enter().append("svg").merge(slider);
		slider.attr("width", function(d) { return d.width; })
			.attr("height", function(d) { return d.height; });
	}

	var g = slider.selectAll("g.slider-container").data([{left: left_margin, top: top_margin, id: this._id}]);
	g.exit().remove();
	g = g.enter().append("g").attr("class", "slider-container").merge(g);
	g.attr("transform", function(d) {
			return "translate(" + d.left + "," + d.top + ")";
		})
		.attr("id", function(d) { return d.id; });

	this.scale = (this._scale ? this._scale() : d3_scaleLinear()).domain(this._domain).range([0, w]);

	if (this._value == null || this._value < this._domain[0]) this._value = this._domain[0];
	else if (this._value > this._domain[1]) this._value = this._domain[1];

	if (this._snap) this._value = snapTo(this._snap, this._value);

	var axes_data = [];
	if (this._axis) {
		var axis;
		if (typeof this._axis != "boolean") {
			axis = this._axis(this.scale);
		}
		else {
			axis = d3Axis.axisBottom().scale(this.scale).tickPadding(6);
		}

		if (this._ticks) axis.ticks(this._ticks);
		if (this._tickFormat) axis.tickFormat(this._tickFormat);
		if (this._tickSize) axis.tickSize(this._tickSize);
		else axis.tickSize(Math.max(5, this._handleRadius - this._channelHeight - 2));
		axes_data.push(axis);
	}

	var axes = g.selectAll(".slider-axis");
	var axes_enter = axes.data(axes_data).enter();
	axes_enter.append("g").attr("class", "slider-axis")
		.attr("transform", "translate(" + 0 + "," + this._channelHeight/2 + ")")
		.each(function(axis) { axis(d3Selection.select(this)); });
	axes_enter.select(".domain").attr("fill", "none");
	axes_enter.selectAll(".tick line").attr("stroke", "black");
	axes_enter.exit().remove();

	var channel, handle;
	channel = g.selectAll(".slider-channel")
		.data([{ width: channel_w, height: this._channelHeight, channel_r: channel_r }]);
	channel.exit().remove();

	channel = channel.enter().append("rect").attr("class", "slider-channel")
		.attr("fill", this._channelFill)
		.attr("cursor", "pointer")
		.on("click", function() {
			var slider_x = Math.max(0, Math.min(w, d3Selection.mouse(this)[0]));
			that._value = that.scale.invert(slider_x);
			if (that._snap) that._value = snapTo(that._snap, that._value);
			handle.attr("cx", that.scale(that._value));
			that.fire("change", that._value);
		})
		.merge(channel);

	channel.attr("width", function(d) { return d.width; })
		.attr("height", function(d) { return d.height; })
		.attr("y", function(d) { return -d.height/2; })
		.attr("x", function(d){ return -d.channel_r; })
		.attr("rx", function(d) { return d.channel_r; });

	var drag_dx_origin, drag_x_origin;
	function handleMousedown(event$$1) {
		document.addEventListener("mouseup", handleMouseup, false);
		document.addEventListener("mousemove", handleMousemove, false);
		drag_dx_origin = event$$1.clientX;
		drag_x_origin = that.scale(that._value);
	}

	function handleMouseup() {
		document.removeEventListener("mouseup", handleMouseup, false);
		document.removeEventListener("mousemove", handleMousemove, false);
	}

	function handleMousemove(event$$1) {
		drag(event$$1.clientX - drag_dx_origin);
	}

	function handleTouchstart(event$$1) {
		if (event$$1.touches.length != 1) return;
		document.addEventListener("touchend", handleTouchend, false);
		document.addEventListener("touchmove", handleTouchmove, false);
		drag_dx_origin = event$$1.touches[0].clientX;
		drag_x_origin = that.scale(that._value);
	}

	function handleTouchend() {
		document.removeEventListener("touchend", handleTouchend, false);
		document.removeEventListener("touchmove", handleTouchmove, false);
	}

	function handleTouchmove(event$$1) {
		if (event$$1.touches.length != 1) return;
		drag(event$$1.touches[0].clientX - drag_dx_origin);
	}

	function drag(dx) {
		var new_x = drag_x_origin + dx;
		var slider_x = Math.max(0, Math.min(w, new_x));
		var new_value = that.scale.invert(slider_x);
		if (that._snap) new_value = snapTo(that._snap, new_value);
		handle.attr("cx", that.scale(new_value));
		if (new_value != that._value) {
			that._value = new_value;
			that.fire("change", that._value);
		}
	}

	handle = g.selectAll(".slider-handle").data([{ v: this._value, x: this.scale(this._value) }]);
	handle = handle.enter().append("circle").attr("class", "slider-handle")
		.attr("cursor", "col-resize")
		.merge(handle);

	handle.attr("cx", function(d) { return d.x; })
		.attr("r", this._handleRadius)
		.attr("fill", this._handleFill)
		.on("mousedown", function() {
			d3Selection.event.preventDefault();
			handleMousedown(d3Selection.event);
		})
		.on("touchstart", function() {
			d3Selection.event.preventDefault();
			handleTouchstart(d3Selection.event);
		});

	var label_data = [];
	if (this._label) {
		label_data.push({
			label: this._label, x: w/2, y: -label_h, font_size: this._labelSize
		});
	}
	var label = g.selectAll(".slider-label").data(label_data);
	label.exit().remove();
	label = label.enter()
		.append("text").attr("class", "slider-label")
		.attr("text-anchor", "middle")
		.attr("cursor", "default")
		.merge(label);

	label
		.text(function(d) { return d.label; })
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.attr("font-size", this._labelSize);

	var end_label_data = [];
	if (this._startLabel) {
		end_label_data.push({
			label: this._startLabel,
				x: this._startLabelBelow ? 0 : -(channel_r + 5 + Math.max(0, this._handleRadius - channel_r)),
				y: this._startLabelBelow ? (channel_r + 15) : this._startEndLabelSize/1.75 - channel_r/2,
				anchor: this._startLabelBelow ? "middle" : "end",
				font_size: this._startEndLabelSize
		});
	}
	if (this._endLabel) {
		end_label_data.push({
			label: this._endLabel,
				x: this._endLabelBelow ? w : w + (channel_r + Math.max(0, this._handleRadius - channel_r) + 5),
				y: this._startLabelBelow ? (channel_r + 15) : this._startEndLabelSize/1.75 - channel_r/2,
				anchor: this._endLabelBelow ? "middle" : "start",
				font_size: this._startEndLabelSize
		});
	}

	var end_labels = g.selectAll(".slider-end-labels").data(end_label_data);
	end_labels.exit().remove();
	end_labels = end_labels.enter().append("text").attr("class", "slider-end-labels")
		.attr("pointer-events", "none")
		.merge(end_labels);
	end_labels
		.text(function(d) { return d.label; })
		.attr("font-size", function(d) { return d.font_size; })
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.attr("text-anchor", function(d) { return d.anchor; });

	return this;
};

Slider.prototype.update = Slider.prototype.draw;

function Kiln_slider(selector) {
	return new Slider(selector);
}
Kiln_slider.version = VERSION;

return Kiln_slider;

})));

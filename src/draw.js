import { select as d3_select, mouse as d3_mouse, event as d3_event } from "d3-selection";
import { axisBottom as d3_axisBottom } from "d3-axis";

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
import d3_scaleLinear from "d3-scale/src/linear";

import closestValue from "./binary_search";

function snapTo(specification, value) {
	if (typeof specification == "boolean") {
		return specification ? Math.round(value) : value;
	}
	// Otherwise assume “specification” is a sorted array
	return closestValue(specification, value);
}


export default function Slider_draw() {
	var slider = this;

	var cw = slider._width,
	    ch = slider._height;

	var container_node = slider.container.node();

	// If the width and height have not been specified, use
	// the client size of the container element.
	if (!cw) {
		var r = container_node.getBoundingClientRect();
		// If there isn’t a bounding client rect, e.g. because
		// the container is display: none;, then do nothing.
		if (!r || r.width == 0) return slider;

		cw = r.width;
		ch = r.height;
	}

	var channel_r = slider._channelRadius == null ? slider._channelHeight/2 : slider._channelRadius,
	    left_margin = (slider._margin.left == null ? Math.max(slider._handleRadius, channel_r) : slider._margin.left),
	    right_margin = (slider._margin.right == null ? Math.max(slider._handleRadius, channel_r) : slider._margin.right),
	    top_margin = slider._margin.top == null ? Math.max(slider._handleRadius, slider._channelHeight/2) : slider._margin.top,
	    w = cw - left_margin - right_margin, // Inner width of the slider channel (excluding endcaps)
	    channel_w = w + 2*channel_r, // Width of the slider channel (including endcaps)
	    label_h = slider._labelSize * 1.5;

	if (slider._label != null && slider._margin.top == null) top_margin += label_h;

	var container_svg;
	if (container_node.namespaceURI == "http://www.w3.org/2000/svg") {
		container_svg = slider.container;
	}
	else {
		container_svg = slider.container.selectAll("svg").data([{ width: cw, height: ch }]);
		container_svg.exit().remove();
		container_svg = container_svg.enter().append("svg").merge(container_svg);
		container_svg.attr("width", function(d) { return d.width; })
			.attr("height", function(d) { return d.height; });
	}

	var g = container_svg.selectAll("g.flourish-slider-container").data([{left: left_margin, top: top_margin, id: slider._id}]);
	g.exit().remove();
	g = g.enter().append("g").attr("class", "flourish-slider-container").merge(g);
	g.attr("transform", function(d) {
			return "translate(" + d.left + "," + d.top + ")";
		})
		.attr("id", function(d) { return d.id; });

	slider.scale = (slider._scale ? slider._scale() : d3_scaleLinear()).domain(slider._domain).range([0, w]);

	if (slider._value == null || slider._value < slider._domain[0]) slider._value = slider._domain[0];
	else if (slider._value > slider._domain[1]) slider._value = slider._domain[1];

	if (slider._snap) slider._value = snapTo(slider._snap, slider._value);

	var axes_data = [];
	if (slider._axis) {
		var axis;
		if (typeof slider._axis != "boolean") {
			axis = slider._axis(slider.scale);
		}
		else {
			axis = d3_axisBottom().scale(slider.scale).tickPadding(6);
		}

		if (slider._ticks) axis.ticks(slider._ticks);
		if (slider._tickFormat) axis.tickFormat(slider._tickFormat);
		if (slider._tickSize) axis.tickSize(slider._tickSize);
		else axis.tickSize(Math.max(5, slider._handleRadius - slider._channelHeight - 2));
		axes_data.push(axis);
	}

	var axes = g.selectAll(".flourish-slider-axis");
	var axes_enter = axes.data(axes_data).enter();
	axes_enter.append("g").attr("class", "flourish-slider-axis")
		.attr("transform", "translate(" + 0 + "," + slider._channelHeight/2 + ")")
		.each(function(axis) { axis(d3_select(this)); });
	axes_enter.select(".domain").attr("fill", "none");
	axes_enter.selectAll(".tick line").attr("stroke", "black");
	axes_enter.exit().remove();

	var channel, handle;
	channel = g.selectAll(".flourish-slider-channel")
		.data([{ width: channel_w, height: slider._channelHeight, channel_r: channel_r }]);
	channel.exit().remove();

	channel = channel.enter().append("rect").attr("class", "flourish-slider-channel")
		.attr("fill", slider._channelFill)
		.attr("cursor", "pointer")
		.on("click", function() {
			var slider_x = Math.max(0, Math.min(w, d3_mouse(this)[0]));
			slider._value = slider.scale.invert(slider_x);
			if (slider._snap) slider._value = snapTo(slider._snap, slider._value);
			handle.attr("cx", slider.scale(slider._value));
			slider.fire("change", slider._value);
		})
		.merge(channel);

	channel.attr("width", function(d) { return d.width; })
		.attr("height", function(d) { return d.height; })
		.attr("y", function(d) { return -d.height/2; })
		.attr("x", function(d){ return -d.channel_r; })
		.attr("rx", function(d) { return d.channel_r; });

	var drag_dx_origin, drag_x_origin;
	function handleMousedown(event) {
		document.addEventListener("mouseup", handleMouseup, false);
		document.addEventListener("mousemove", handleMousemove, false)
		drag_dx_origin = event.clientX;
		drag_x_origin = slider.scale(slider._value);
	}

	function handleMouseup() {
		document.removeEventListener("mouseup", handleMouseup, false);
		document.removeEventListener("mousemove", handleMousemove, false)
	}

	function handleMousemove(event) {
		drag(event.clientX - drag_dx_origin);
	}

	function handleTouchstart(event) {
		if (event.touches.length != 1) return;
		document.addEventListener("touchend", handleTouchend, false);
		document.addEventListener("touchmove", handleTouchmove, false)
		drag_dx_origin = event.touches[0].clientX;
		drag_x_origin = slider.scale(slider._value);
	}

	function handleTouchend() {
		document.removeEventListener("touchend", handleTouchend, false);
		document.removeEventListener("touchmove", handleTouchmove, false)
	}

	function handleTouchmove(event) {
		if (event.touches.length != 1) return;
		drag(event.touches[0].clientX - drag_dx_origin);
	}

	function drag(dx) {
		var new_x = drag_x_origin + dx;
		var slider_x = Math.max(0, Math.min(w, new_x));
		var new_value = slider.scale.invert(slider_x);
		if (slider._snap) new_value = snapTo(slider._snap, new_value);
		handle.attr("cx", slider.scale(new_value));
		if (new_value != slider._value) {
			slider._value = new_value;
			slider.fire("change", slider._value);
		}
	}

	handle = g.selectAll(".flourish-slider-handle").data([{ v: slider._value, x: slider.scale(slider._value) }]);
	handle = handle.enter().append("circle").attr("class", "flourish-slider-handle")
		.attr("cursor", "col-resize")
		.merge(handle);

	handle.attr("cx", function(d) { return d.x; })
		.attr("r", slider._handleRadius)
		.attr("fill", slider._handleFill)
		.on("mousedown", function() {
			d3_event.preventDefault();
			handleMousedown(d3_event);
		})
		.on("touchstart", function() {
			d3_event.preventDefault();
			handleTouchstart(d3_event);
		})

	var label_data = [];
	if (slider._label) {
		label_data.push({
			label: slider._label, x: w/2, y: -label_h, font_size: slider._labelSize
		});
	}
	var label = g.selectAll(".flourish-slider-label").data(label_data);
	label.exit().remove();
	label = label.enter()
		.append("text").attr("class", "flourish-slider-label")
		.attr("text-anchor", "middle")
		.attr("cursor", "default")
		.merge(label);

	label
		.text(function(d) { return d.label; })
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.attr("font-size", slider._labelSize);

	var end_label_data = [];
	if (slider._startLabel) {
		end_label_data.push({
			label: slider._startLabel,
				x: slider._startLabelBelow ? 0 : -(channel_r + 5 + Math.max(0, slider._handleRadius - channel_r)),
				y: slider._startLabelBelow ? (channel_r + 15) : slider._startEndLabelSize/1.75 - channel_r/2,
				anchor: slider._startLabelBelow ? "middle" : "end",
				font_size: slider._startEndLabelSize
		});
	}
	if (slider._endLabel) {
		end_label_data.push({
			label: slider._endLabel,
				x: slider._endLabelBelow ? w : w + (channel_r + Math.max(0, slider._handleRadius - channel_r) + 5),
				y: slider._startLabelBelow ? (channel_r + 15) : slider._startEndLabelSize/1.75 - channel_r/2,
				anchor: slider._endLabelBelow ? "middle" : "start",
				font_size: slider._startEndLabelSize
		});
	}

	var end_labels = g.selectAll(".flourish-slider-end-labels").data(end_label_data);
	end_labels.exit().remove();
	end_labels = end_labels.enter().append("text").attr("class", "flourish-slider-end-labels")
		.attr("pointer-events", "none")
		.merge(end_labels);
	end_labels
		.text(function(d) { return d.label; })
		.attr("font-size", function(d) { return d.font_size; })
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.attr("text-anchor", function(d) { return d.anchor; });

	return slider;
}

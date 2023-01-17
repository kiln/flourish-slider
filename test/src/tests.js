import { select } from "d3-selection";
import { format } from "d3-format";
import { scaleTime } from "d3-scale";
import Slider from "../../src/slider";


// Expose the slider objects so we can play around with them in the console
var sliders = window.sliders = {};

function test1() {
	var output = select("#test1 .output");
	var slider = Slider("#test1 .slider").margin({top: 13})
		.on("change", function(x) {
			output.text(format(".4f")(x));
		})
		.draw();

	// Check that update() doesn’t needlessly replace the DOM elements
	var el = document.querySelector("#test1 .slider .slider-channel");
	slider.update();
	if (el != document.querySelector("#test1 .slider .slider-channel")) {
		console.error("test1: Updating the slider replaced the channel element");
	}

	select("#test1 button.reset").on("click", function() {
		slider.value(0.5).draw();
	});
	select("#test1 button.redraw").on("click", function() {
		slider.draw();
	});

	sliders.test1 = slider;
}

function test2() {
	var slider = Slider("#test2 .slider")
		.domain([2000, 2014])
		.value(2000)
		.snap(true)
		.margin({ top: 50, left: 65, right: 65 })
		.startLabel(2000)
		.label(2000)
		.endLabel(2014)
		.handleRadius(12)
		.on("change", function(new_year) {
			// Sometimes in real code it is convenient to set the value of the slider here,
			// because the same code is called when the year has been changed by the
			// slider or by some other mechanism. Make sure this doesn’t cause problems.
			if (slider) slider.value(new_year).label(new_year).update();
		})
		.draw();

	sliders.test2 = slider;
}

function test3() {
	var output = select("#test3 .output");
	var slider = Slider("#test3 .slider")
		.domain([2000, 2014])
		.axis(true)
		.ticks(2)
		.tickFormat(format("d"))
		.on("change", function(x) {
			output.text(format(".4f")(x));
		})
		.draw();

	sliders.test3 = slider;
}

function test4() {
	var output = select("#test4 .output");
	var slider = Slider("#test4 .slider")
		.scale(scaleTime)
		.domain([
			new Date(2012, 0, 1),
			new Date(2013, 0, 1)
		])
		.axis(true).ticks(4).tickFormat(scaleTime().tickFormat())
		.on("change", function(x) {
			output.text(x.toISOString().substr(0, 10));
		})
		.draw();

	sliders.test4 = slider;
}

function test5() {
	var slider = Slider("#test5 .slider")
		.axis(true)
		.handleFill("red")
		.on("change", function() { slider.update(); })
		.update();

	sliders.test5 = slider;
}

function test6() {
	var slider = Slider("#test6 .slider")
		.domain([1900, 2000])
		.axis(true)
		.tickFormat(format("d"))
		.value(1950)
		.snap(true)
		.label("Year")
		.handleRadius(5)
		.channelHeight(50)
		.on("change", function(new_year) {
			if (slider) slider.value(new_year).label(new_year).update();
		})
		.draw();

	sliders.test6 = slider;
}

function test7() {
	var slider = Slider("#test7 .slider")
		.domain([1900, 2000])
		.axis(true)
		.tickFormat(format("d"))
		.value(1950)
		.snap(true)
		.label("Year")
		.handleRadius(25)
		.channelHeight(5)
		.on("change", function(new_year) {
			if (slider) slider.value(new_year).label(new_year).update();
		})
		.draw();

	sliders.test7 = slider;
}

function test8() {
	var slider = Slider("#test8 .slider")
		.domain([1900, 2000])
		.margin({top: 20, left: 100, right: 100})
		.tickFormat(format("d"))
		.value(1950)
		.snap(true)
		.startLabel(1900)
		.endLabel(2000)
		.label("Year")
		.handleRadius(15)
		.channelHeight(30)
		.on("change", function(new_year) {
			if (slider) slider.value(new_year).label(new_year).update();
		})
		.draw();

	sliders.test8 = slider;
}

function test9() {
	var slider = Slider("#test9 .slider")
		.domain([1900, 2000])
		.margin({top: 20, left: 100, right: 100})
		.tickFormat(format("d"))
		.value(1950)
		.snap(true)
		.startLabel(1900)
		.endLabel(2000)
		.startLabelBelow(true)
		.endLabelBelow(true)
		.label("Year")
		.handleRadius(15)
		.channelHeight(30)
		.on("change", function(new_year) {
			if (slider) slider.value(new_year).label(new_year).update();
		})
		.draw();

	sliders.test9 = slider;
}

function test10() {
	var slider = Slider("#test10 .slider")
		.domain([0, 1])
		.tickFormat(format("d"))
		.value(0)
		.margin({ left: 42, right: 42 })
		.snap(true)
		.startLabel("Off")
		.endLabel("On")
		.handleRadius(15)
		.channelHeight(30)
		.draw();

	sliders.test10 = slider;
}

function test11() {
	var slider = Slider("#test11 .slider svg g")
		.width(400).height(50)
		.domain([0, 10])
		.tickFormat(format("d"))
		.value(0)
		.margin({ left: 42, right: 42 })
		.handleRadius(15)
		.channelHeight(30)
		.draw();

	sliders.test11 = slider;
}

function test12() {
	var slider = Slider("#test12 .slider")
		.tickFormat(format("d"))
		.margin({ left: 42, right: 42 })
		.handleRadius(15)
		.channelHeight(30)
		.channelRadius(0)
		.draw();

	sliders.test10 = slider;
}

function test13() {
	var slider = Slider("#test13 .slider")
		.domain([0, 1])
		.tickFormat(format("d"))
		.value(0)
		.margin({ left: 42, right: 42 })
		.snap(true)
		.startLabel("Off")
		.endLabel("On")
		.handleRadius(15)
		.channelHeight(30)
		.channelFill("#eee")
		.on("change", function(x) {
			slider
				.channelFill(["#eee", "red"][x])
				.handleFill(["black", "blue"][x])
				.update();
		})
		.draw();

	sliders.test13 = slider;
}


document.addEventListener("DOMContentLoaded", function() {
	test1();
	test2();
	test3();
	test4();
	test5();
	test6();
	test7();
	test8();
	test9();
	test10();
	test11();
	test12();
	test13();
});

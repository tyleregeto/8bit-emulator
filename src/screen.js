// This is our virtual screen. It defines a single function for setting
// a pixel value. The graphics unit provides higher level functions on
// top of this. Scale increases the pixel size, simulating lower res screens.

te.provide("te");

// TODO move into screen unit
var SCR_MEM_START = 0x00A0;

var newScreenUnit = function(mem, width, height, scaleUp) {
	// Flag which makes the screen twice the size visually. This is done by
	// make each vitual pixel occupy 4 real screen pixels. This makes the screen
	// look a lot more like a real 8 bit screen, pixels are too small these days! 
	var scale = 1;
	if (scaleUp) {
		// 2 is the only value that works.
		scale = 2;
	}

	var canvas = document.createElement("canvas");
	canvas.setAttribute("width", (width * scale) + "px");
	canvas.setAttribute("height", (height * scale) + "px");

	var img = document.getElementById("img-canvas-view");
	if (img && canvas.toDataURL) {
		img.style.width = (width * scale) + "px";
		img.style.height = (height * scale) + "px";
		img.src = canvas.toDataURL();
	} else {
		document.body.appendChild(canvas);
	}

	// start with a black screen
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(0, 0, width * scale, height * scale);

	// we'll draw to this then repalce the canvas with it
	var frame = ctx.createImageData(width * scale, height * scale);
	var data = frame.data;
	var time = 0;

	// Html canvas has no setPixel method, so we use a 1x1 image
	// to simulate it when drawing our pixels. fillRect would also work. 
	// var img = ctx.createImageData(1 * scale, 1 * scale);
	// var p  = img.data;

	// TODO update this so it redraws full screen each frame, reading directly from memory?
	// We would then drop the API

	// Reading pixels
	// -------------------------------------
	// Each byte contians 8 bits, representing two pixels. We read them as so, (reading left to right)
	// bits 1, 2, 3, 4 - first pixel color
	// bits 5, 6, 7, 8 - second pixel color

	// reversed for edianess
	var flags = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80].reverse();

	function setPixel(r, g, b, a, row, col) {
		var idx = (row * width + col) * 4;
		var pos = [idx];

		// we support upscaling the screen
		if (scale > 1) {
			idx = (row * (width * 4) + (col * scale)) * 4;
			pos = [
				idx,
				idx + 4,
				idx + (width * scale * 4),
				idx + (width * scale * 4) + 4
			];
		}

		for (var i = 0; i < pos.length; i++) {
			var p = pos[i];
			data[p] = r;
			data[p + 1] = g;
			data[p + 2] = b;
			data[p + 3] = a;
		}
	}

	function render() {
		ctx.putImageData(frame, 0, 0);
		if (img) {
			img.src = canvas.toDataURL();
		}
	}

	return {
		// This is equivilent to C64's hi-res mode
		tick: function() {
			// renders at 30 frames per second
			var cur = Date.now();
			var shouldRender = cur - time >= 1000 / 30;
			if (!shouldRender) {
				return;
			}

			time = cur;

			// re draw the screen
			var numPixels = width * height;
			var r, g, b;
			var a = 255;
			var idx = 0;
			var pix = 0;

			for (var i = 0; i < numPixels / 8; i++) {
				var section = mem.get(SCR_MEM_START + i);
				// each section contains 8 pixel values (each bit is a pixel)
				// there is no colour, just on/off
				for (var j = 0; j < 8; j++) {
					var on = section & (flags[j]);
					if (on > 0) {
						r = g = b = 255;
					} else {
						r = g = b = 0;
					}

					// This works over the setPixel method as long as
					// we have scale set to 1.
					//data[idx] = r;
					//data[idx + 1] = g;
					//data[idx + 2] = b;
					//data[idx + 3] = a;

					// Hanf of the rendering, this method has support for scaling up
					// each pixel when applying to real screen space. 
					setPixel(r, g, b, a, Math.floor(pix / width), pix % width);

					idx += 4;
					pix++;
				}
			}

			ctx.putImageData(frame, 0, 0);
			if (img) {
				img.src = canvas.toDataURL();
			}
		}
	};
}

// TODO this should be converted to a assembler routine
// Adds some helper methods for copying regular memory data to the screen memory.
function newGraphicsUnit(mem) {
	return {
		// draws typography symbol
		// all are assumed to be 8x8 px
		drawSymbol: function(p, col, row) {
			var rowSize = 40; // SCR_WIDTH / 8;
			var y = (row * 8) * rowSize;
			var x = col;

			for (var i = 0; i < 8; i++) {
				var idx = (SCR_MEM_START + y) + (rowSize * i) + x;
				mem.set(idx, mem.get(p));

				p++;
			}
		}
	};
}
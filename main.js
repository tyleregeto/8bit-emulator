
// Current tasks
// 1. implement JMP, EQJ, LTJ, GTJ
// 1. implement CMP
// 1. Assembly code to support named memory locations .loop-abc (compiler would grab the memory address for all future refrences)


// Define some consts. This is cheating, but we want
// to be ably to change this global while developing it
// screen memory start location
var SCR_MEM_START = 0x03E8; // 1000
var SCR_WIDTH = 320;
var SCR_HEIGHT = 200;
var CHR_MEM_START = 0x40; // 64
var PRG_MEM_START = 0x2328; // 9000

// Machine Language Instructions
// ------------------------

// CPU registers
var RA = 0x01;
var RX = 0x02;
var RY = 0x03;

// NUL is not used, just an empty instruction that gets skipped
// As a result, any memory address that is empty, is treated as NUL,
// and the program continues to step forward.
var NUL = 0x00;

// Load a value into the accumulator
var LDAV = 0x01; // 1 arg: value
var LDAA = 0x02; // 1 arg: address
var LDAP = 0x03; // 1 arg: page
var LDAR = 0x04; // 1 arg: register

// Load the accumulator value into the specified address or register
var STA = 0x10; // 1 arg: address
var STR = 0x11; // 1 aarg: register

// Math

// clear carry flag
//var CLC = 0x30;
// set carry lag
//var SEC = 0x31;


// Log int/string, prints src to web browser console.
var LGIV = 0xF0; // src
var LGIA = 0xF1; // src
var LGIR = 0xF2; // src

var LGS = 0xF3; // len, src (max len: 255)


// DEPRECIATED
/*
// Math
var ADD = 0x02; //src, dest
var SUB = 0x03; //src, dest
var MUL = 0x04; //src, dest
var DIV = 0x05; //src, dest
// Binary operations
// Shift right/left
var SHR = 0x00;
var SHL = 0x00;
var XOR = 0x00;
var AND = 0x00;
// compare two values
var CMP = 0x00;
// Flow
// jump to memry location
var JMP = 0x00;
// jump if last CMP was true
var JE = 0x01;
// jump if last CMP was not true
var JNE = 0x01;
*/

function newMemoryUnit(size /*int, size of memory in bytes */) {
	// array of bytes, 8 bits per bytes, values of 0-255
	var mem = new Uint8Array(size);
	// default to zero value.
	for(var i=0;i<size;i++) {
		//mem[i] = 0;
	}

	// interface to the memory unit
	return {
		mem: mem,

		get: function(loc /*int*/) {
			// TODO support memory overflow, anything biiger than size wraps backround zero
			return mem[loc];
		},
		set: function(loc, val) {
			// TODO support memory overflow
			mem[loc] = val;
		},
		// loads a chunck of data into memory at the given location
		load: function(p /*int, pointer to loc to load into*/, arr /*arr of Uint8*/) {
			for(var i=0; i<arr.length; i++) {
				mem[p+i] = arr[i];
			}
 		},
 		// copies `len` bytes in memory from s to e
 		// does not modify s.
 		copy: function(s, e, len) {
 			for(var i=0; i<len; i++) {
				mem[e+i] = mem[s+i];
			}
 		}
	};
}

// Adds some helper methods for copying regular memory data to the screen memory.
function newGraphicsUnit(mem) {
	return {
		// draws typography symbol
		// all are assumed to be 8x8 px
		drawSymbol: function(p, col, row) {
			var rowSize = SCR_WIDTH / 8;
			var y = (row * 8) * rowSize;
			var x = col;

			for(var i=0; i<8; i++) {
				var idx = (SCR_MEM_START + y) + (rowSize * i) + x;
				mem.set(idx, mem.get(p));

				p++;
			}
		}
	};
}

// This is our virtual screen. It defines a single function for setting
// a pixel value. The graphics unit provides higher level functions on
// top of this. Scale increases the pixel size, simulating lower res screens.
function newScreenUnit(mem, width, height, scaleUp) {
	// Flag which makes the screen twice the size visually. This is done by
	// make each vitual pixel occupy 4 real screen pixels. This makes the screen
	// look a lot more like a real 8 bit screen, pixels are too small these days! 
	var scale = 1;
	if(scaleUp) {
		// 2 is the only value that works.
		scale = 2;
	}

	var canvas = document.createElement("canvas");
	canvas.setAttribute("width", (width * scale)+"px");
	canvas.setAttribute("height", (height * scale)+"px");
	document.body.appendChild(canvas);
	
	// start with a black screen
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(0, 0, width*scale, height*scale);

	// we'll draw to this then repalce the canvas with it
	var frame = ctx.createImageData(width * scale, height * scale);
	var data = frame.data;

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
	var flags = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80].reverse();

	function setPixel(r, g, b, a, row, col) {
		var idx = (row * SCR_WIDTH + col) * 4;
		var pos = [idx];

		// we support upscaling the screen
		if(scale > 1) {
			idx = (row * (SCR_WIDTH * 4) + (col * scale)) * 4;
			pos = [
				idx,
				idx + 4,
				idx + (SCR_WIDTH * scale * 4),
				idx + (SCR_WIDTH * scale * 4) + 4
			];
		}

		for(var i=0; i<pos.length; i++) {
			var p = pos[i];
			data[p] = r;
			data[p + 1] = g;
			data[p + 2] = b;
			data[p + 3] = a;
		}
	}

	return {
		// This is equivilent to C64's hi-res mode
		tick: function() {
			// re draw the screen
			var numPixels = width * height;
			var r = g = b = a = 255;
			var idx = 0;
			var pix = 0;
			
			for(var i=0; i<numPixels / 8; i++) {
				var section = mem.get(SCR_MEM_START + i);
				// each section contains 8 pixel values (each bit is a pixel)
				// there is no colour, just on/off
				for(var j=0; j<8;j++) {
					var on = section & (flags[j]);
					if(on > 0) {
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
					setPixel(r,g,b,a, Math.floor(pix / SCR_WIDTH), pix % SCR_WIDTH);
					
					idx += 4;
					pix++;
				}
			}

			ctx.putImageData(frame, 0, 0);
		}
	};
}

// Compiles assembly into machine language
// Interesting fact: Assembly is fairly "high level". See how many instructions
// (eg: CMP) abstract away several different machine commands
function compileProgram(p, mem, src /*string of */) {
	// some commonly used var names
	var arg1;
	var arg2;
	var len;
	var val;
	var j;

	// this is almost cheating, but saves a bunch of conditionals
	var registers = {'%rx':RX, '%ry':RY, '%ra': RA};	
	
	var lines = src.split("\n");
	for(var i=0; i<lines.length; i++) {
		var line = lines[i].trim();

		if(line.length === 0) {
			continue;
		}

		var parts = line.split(" ");
		var numargs = parts.length;
		var op = parts[0];
		arg1 = parts[1];
		arg2 = parts[2];

		if(op === "MOV") {
			// TODO accept both hex & base 10 nums? Always store as hex
			
			// read from src
			switch(arg1[0]) {
			case '%':
				mem[p++] = LDAR;
				mem[p++] = parseInt(arg1.substr(1), 16);
				break;
			case '$':
				mem[p++] = LDAV;
				mem[p++] = parseInt(arg1.substr(1), 16);
				break;
			default:
				mem[p++] = LDAA;
				mem[p++] = parseInt(arg1, 16);
				// TODO address can be paged or absolute
				break;
			}

			// move into dest
			switch(arg2[0]) {
			case '%':
				mem[p++] = STR;
				mem[p++] = arg2 === '%rx' ? RX : RY;
				break;
			default:
				val = parseInt(arg1.substr(1), 16);
				mem[p++] = STA;
				mem[p++] = val >> 8;
				mem[p++] = val | 256;
				break;
			}
		}
		else if(op == "LGI") {
			switch(arg1[0]) {
			case '$':
				mem[p++] = LGIV;
				mem[p++] = parseInt(arg1.substr(1), 16);
				break;
			case '%':
				mem[p++] = LGIR;
				mem[p++] = registers[arg1];
				break;
			default:
				mem[p++] = LGIA;
				mem[p++] = val >> 8;
				mem[p++] = val | 256;
				break;
			}
		}
		else if(op == "LGS") {
			len = 1;
			val = arg1;

			// len is an option var, defaults to 1
			if(numargs === 3) {
				len = parseInt(arg1, 16);
				val = arg2;
			}
			
			mem[p++] = LGS;
			mem[p++] = len;
			for(j=0;j<len;j++) {
				mem[p++] = val.charCodeAt(j);
			}
		}
	}
}

function newCpuUnit(mem) {
	// The cpu has some special registers
	// the result of the last CMP operation (0 or 1)
	var cmp_res = 0; // TODO remove? Value would go in a
	// the remainder from the last DIV operation
	var div_rem = 0; // TODO remove? Value would go in a
	// general purpose CPU registers
	var a = 0;
	var x = 0;
	var y = 0;

	// A pointer to the memory location for the current running program
	var pp = PRG_MEM_START;

	// limit number of log calls
	var logCount = 0;
	var maxLogCount = 100;

	// loads the next two registers and returns them as a single 16bit value
	function next16bit() {
		var a = mem[pp++];
		var b = mem[pp++];
		return (a << 8) | b;
	}

	// everything runs in a callback because JS will timeout
	return {
		tick: function() {
			if(pp >= mem.length) {
				console.log("out of bounds");
				return;
			}

			var b = mem[pp++];
			var r;
			var add;

			switch(b) {
			case NUL:
				break;

			case LDAV:
				// TODO we need to support values larger than 255, another op for this?
				a = mem[pp++];
				break;

			case LDAP:
				add = mem[pp++];
				a = mem[add];
				break;

			case LDAA:
				add = next16bit();
				a = mem[add];
				break;

			case LDAR:
				r = mem[pp++];
				a = r == RX ? x : y;
				break;

			case STA:
				add = next16bit();
				mem[a] = a;
				break;

			case STR:
				if(mem[pp++] == RX) {
					x = a;
				} else {
					y = a;
				}
				break;

			case LGIV:
				if(logCount < maxLogCount) {
					logCount++;
					console.log("Log int (value): ", mem[pp++]);
				}
				break;

			case LGIR:
				if(logCount < maxLogCount) {
					logCount++;
					switch(mem[pp++]) {
					case RA:
						val = a;
						break;
					case RX:
						val = x;
						break;
					case RY:
						val = y;
						break;	
					}
					console.log("Log int (register): ", val);
				}
				break;

			case LGIA:
				if(logCount < maxLogCount) {
					logCount++;
					r = next16bit();
					console.log("Log int (address): ", mem[r]);
				}
				break;

			case LGS:
				if(logCount < maxLogCount) {
					logCount++;
					var len = mem[pp++];
					var output = "";
					for(var j=0;j<len;j++) {
						output += String.fromCharCode(mem[pp++]);
					}
					console.log("Log str: ", output);
					// TODO src and len need to support registers
				}
				break;

			default:
				console.log("Unknown op: ", b);
			}
		}
	};
}

function newClock(arr, rate) {
	setInterval(function() {
		for(var i = 0; i < arr.length; i++) {
			arr[i].tick();
		}
	}, rate);
}

function loadBios(mem) {
	// TODO load the bios program into memory. The CPU will always start
	// at 0, which is where the bio begins.
}

// makes a computer that is sorta comparible to a commodore64
function newComputer() {
	var mem = newMemoryUnit(64000);
	// Our computer comes with character memory prebuilt in.
	// This contains the data required to render A-B, a-c, 0-9, and .,'?!$()<>+=/*
	mem.load(CHR_MEM_START, [
		// each row contains a character, characters occupy 8x8 of screen space
		// each bit contains an on/off value for the pixel, each int is a row. 
		0x18, 0x3C, 0x66, 0x7E, 0x66, 0x66, 0x66, 0x00, // A
		0xFC, 0xC2, 0xC2, 0xFE, 0xC2, 0xC2, 0xFC, 0x00, // B
		0x3E, 0x73, 0x60, 0x60, 0x60, 0x73, 0x3E, 0x00, // C
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _D
		0xFE, 0xC0, 0xC0, 0xFC, 0xC0, 0xC0, 0xFE, 0x00, // E
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _F
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _G
		0xC6, 0xC6, 0xC6, 0xFE, 0xC6, 0xC6, 0xC6, 0x00, // H
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _I
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _J
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _K
		0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xFC, 0x00, // L
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _M
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _N
		0x7C, 0xC2, 0xC2, 0xC2, 0xC2, 0xC2, 0x7C, 0x00, // O
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _P
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _Q
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _R
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _S
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _T
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _U
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _V
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _W
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _X
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _Y
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _Z
		//
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _0
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _1
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _2
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _3
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _4
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _5
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _6
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _7
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _8
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _9
		//
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _.
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _?
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _!
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _$
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // _'
	]);

	var cpu = newCpuUnit(mem.mem);
	var ghx = newGraphicsUnit(mem);

	// same screen res as commordore64
	var scr = newScreenUnit(mem, SCR_WIDTH, SCR_HEIGHT, true);

	// Start debug data
	
	// copy the letter A into screen space
	// mem.copy(0x21, 0xFF, 8)
	//ghx.drawSymbol(CHR_MEM_START,           1, 8);
	//ghx.drawSymbol(CHR_MEM_START + 8,       2, 8);
	//ghx.drawSymbol(CHR_MEM_START + (8 * 2), 3, 8);
	//d
	//ghx.drawSymbol(CHR_MEM_START + (8 * 4), 4, 8);
	//f
	//g
	ghx.drawSymbol(CHR_MEM_START + (8 * 7), 1, 1);
	ghx.drawSymbol(CHR_MEM_START + (8 * 4), 2, 1);
	ghx.drawSymbol(CHR_MEM_START + (8 * 11), 3, 1);
	ghx.drawSymbol(CHR_MEM_START + (8 * 11), 4, 1);
	ghx.drawSymbol(CHR_MEM_START + (8 * 14), 5, 1);
	
	// a simple test program
	var _ = "";
	_ += "LGI $5\n";
	_ += "LGI $6\n";
	_ += "LGS 1 A\n";
	_ += "LGS 2 AB\n";	
	_ += "MOV $4 0xEFEF\n";
	_ += "LGI 0xEFEF\n";
	_ += "MOV $5 0xEF\n";
	_ += "LGI 0xEF\n";
	_ += "MOV $7 %rx\n";
	_ += "LGI %rx\n";

	compileProgram(PRG_MEM_START, mem.mem, _);
	
	// End debug data

	newClock([cpu, scr], 1000 / 30);
}

newComputer();
// The CPU reads and processes maching language

te.provide("te");

// Machine Language Instructions
// ------------------------

// NUL is not used, just an empty instruction that gets skipped
// As a result, any memory address that is empty, is treated as NUL,
// and the program continues to step forward.
var NUL = 0x00;

// CPU registers
var RA = 0x01;
var RX = 0x02;
var RY = 0x03;

// Load a value into the accumulator
var LDAV = 0x01; // 1 arg: value
var LDAA = 0x02; // 1 arg: address
var LDAP = 0x03; // 1 arg: page
var LDAR = 0x04; // 1 arg: register

// Load the accumulator value into the specified address or register
var STA = 0x10; // 1 arg: address
var STR = 0x11; // 1 arg: register

// Compare the value in the accumlator to the specified register
//var CMPV = 0x12; // Compare the accumulator to a value, 1 arg: value
//var CMPA = 0x13; // Compare the accumulator to a address, 1 arg: address
//var CMPP = 0x14; // Compare the accumulator to a page, 1 arg: page 
//var CMPR = 0x15; // Compare the accumulator to a register, 1 arg: register 

// Jumps
var JMP = 0x16; // jump to a new memory address, new address is read from accumulator

// NOTE: These are no longer machine instructions, now only part of higher level ASM language
// var JSR = 0x18; // jump to a new memory address, saving current address for return
// var RET = 0x19; // return to the address(+1) saved by JSR before jumping 

// Branches. These evaluate the result of the comapre operators
// TODO numbers have been thrown off by one, need to shift them all down, or add some buffers
//var BEQ = 0x19; // jump if equal to 0, 1 arg: address
//var BNE = 0x20; // jump if NOT equal to 0, 1 arg: address
//var BLT = 0x21; // jump if less than 0, 1 arg: address
//var BGT = 0x22; // jump if greater than 0, 1 arg: address

// Assert
var ASRR = 0x23; // assert a register is equal to a value
var ASRV = 0x24; // assert a value is equal to a value
var ASRA = 0x25; // assert that the value at an address is equal to a value
var ASNR = 0x26; // assert a register is NOT equal to a value
var ASNV = 0x27; // assert a value is NOT equal to a value
var ASNA = 0x28; // assert that the value at an address is NOT equal to a value

// Math
// clear carry flag
//var CLC = 0x30;
// set carry lag
//var SEC = 0x31;

// Logging to browser console
var LGIV = 0xF0; // Log integer value, args: src 
var LGIA = 0xF1; // Log integer from address, args: src
var LGIR = 0xF2; // Log integer from register, args: src
var LGS = 0xF3; // Log string value, args: len (0-255), src


// Each call to cpu.tick preforms a single CPU instruction
function newCpuUnit(mem, progMemStart) {
	// sanity check
	mem[500] = 0x02;
	mem[501] = 0x02;
	assertEqual(mem[100], mem[101]);
	pp = 500;
	assertEqual(0x0202, next16bit());

	// The cpu has some special registers
	// the result of the last CMP operation (0 or 1)
	var cmp_res = 0; // TODO remove? Value would go in a
	// the remainder from the last DIV operation
	var div_rem = 0; // TODO remove? Value would go in a
	// general purpose CPU registers
	var a = 0; // acummulator
	var x = 0; // %rx
	var y = 0; // %ry

	// A pointer to the memory location for the current running program
	var pp = progMemStart;

	// limit number of log calls
	var logCount = 0;
	var maxLogCount = 100;

	// loads the next two registers and returns them as a single 16bit value
	function next16bit() {
		var a = mem[pp++];
		var b = mem[pp++];
		return (a << 8) | b;
	}

	function assertEqual(a, b) {
		if (a !== b) throw te.sprintf("Assert failed, value {0} should equal to {1}", a, b);
	}

	function assertNotEqual(a, b) {
		if (a === b) throw te.sprintf("Assert failed, value {0} should NOT equal to {1}", a, b);
	}

	// everything runs in a callback because JS will timeout
	return {
		tick: function() {
			if (pp >= mem.length) {
				console.log("out of bounds");
				return;
			}

			var b = mem[pp++];
			var r;
			var add;
			var val;

			switch (b) {
				case NUL:
					break;
					//
					// START LOAD ACCUMULATOR
					//
				case LDAV:
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
					//
					// START STORE ACCUMULATOR
					//
				case STA:
					add = next16bit();
					mem[add] = a;
					break;
				case STR:
					if (mem[pp++] == RX) {
						x = a;
					} else {
						y = a;
					}
					break;
					//
					// START POINTER MOVS
					//
				case JMP:
					pp = a;
					break;
					//
					// START ASSERTS
					//
				case ASRR:
					r = mem[pp++];
					a = r == RX ? x : y;
					assertEqual(a, mem[pp++]);
					break;
				case ASRV:
					assertEqual(mem[pp++], mem[pp++])
					break;
				case ASRA:
					a = next16bit();
					assertEqual(mem[a], mem[pp++]);
					break;
				case ASNR:
					r = mem[pp++];
					a = r == RX ? x : y;
					assertNotEqual(a, mem[pp++]);
					break;
				case ASNV:
					assertNotEqual(mem[pp++], mem[pp++])
					break;
				case ASNA:
					add = next16bit();
					a = mem[add];
					assertNotEqual(a, mem[pp++]);
					break;
					//
					// START LOGGING
					//
				case LGIV:
					if (logCount < maxLogCount) {
						logCount++;
						console.log("Log int (value): ", mem[pp++]);
					}
					break;
				case LGIR:
					if (logCount < maxLogCount) {
						logCount++;
						switch (mem[pp++]) {
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
					if (logCount < maxLogCount) {
						logCount++;
						r = next16bit();
						console.log("Log int (address): ", mem[r]);
					}
					break;
				case LGS:
					if (logCount < maxLogCount) {
						logCount++;
						var len = mem[pp++];
						var output = "";
						for (var j = 0; j < len; j++) {
							output += String.fromCharCode(mem[pp++]);
						}
						console.log("Log str: ", output);
					}
					break;
				default:
					console.log("Unknown op: ", b);
			}
		}
	};
}
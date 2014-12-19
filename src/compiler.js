// Compiles assembly into machine language
// Interesting fact: Assembly is fairly "high level". See how many instructions
// (eg: CMP) abstract away several different machine commands

"use strict";

te.provide("te.asm");

te.asm.compile = function(p, mem, src /*string of */ ) {
	// some commonly used var names
	var arg1;
	var arg2;
	var len;
	var val;
	var j;

	// this is almost cheating, but saves a bunch of conditionals
	var registers = {
		'%rx': RX,
		'%ry': RY,
		'%ra': RA
	};

	var named_address = {
		// eg: .foo = 0xf0
	};

	var missing_named = {
		// eg: .foo = [0xf0, 0xf5]
	};


	var lines = src.split("\n");
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i].trim();

		if (line.length === 0) {
			continue;
		}

		var parts = line.split(" ");
		var numargs = parts.length;
		var op = parts[0];
		arg1 = parts[1];
		arg2 = parts[2];

		if (op[0] === ".") {
			// named addressed must be unique
			if (named_address[op] !== undefined) throw te.sprintf('Named address {0} is declared more than once', op);
			// Its a named address declaration. Save the memory location
			named_address[op] = p;
			// If there are parts of program that are waiting for this address value,
			// populate those now. Named adresses are always stored as a 16 bit value
			// because we don't know hte size until encountered.
			if (missing_named[op]) {
				for (var j = 0; j < missing_named[op].length; j++) {
					var loc = missing_named[op][j];
					mem[loc] = p >> 8;;
					mem[loc + 1] = p | 256;
				}
				delete missing_named[op];
			}
		} else if (op === 'ASR') {
			// Assert equal (int comaprison)
			switch (arg1[0]) {
				case '%':
					mem[p++] = ASRR;
					addReg(arg1);
					break;
				case '$':
					mem[p++] = ASRV;
					addInt(arg1.substr(1), 8);
					break;
					// TODO add support for paged addresses
				default:
					mem[p++] = ASRA;
					addInt(arg1, 16, true);
					break;
			}
			// arg2 must always be a 8 bit explicit value
			if (arg2[0] !== '$') throw te.sprintf('ASR requires the second argument be a value, eg: $0xFF');
			addInt(arg2.substr(1), 8);

		} else if (op === 'ASN') {
			// Assert not equal
			switch (arg1[0]) {
				case '%':
					mem[p++] = ASNR;
					addReg(arg1);
					break;
				case '$':
					mem[p++] = ASNV;
					addInt(arg1.substr(1), 8);
					break;
				default:
					mem[p++] = ASNA;
					addInt(arg1, 16);
					break;
			}
			// arg2 must always be a 8 bit explicit value
			if (arg2[0] !== '$') throw te.sprintf('ASN requires the second argument be a value, eg: $0xFF');
			addInt(arg2.substr(1), 8);

		} else if (op === "MOV") {
			// read from src
			switch (arg1[0]) {
				case '%':
					mem[p++] = LDAR;
					addReg(arg1);
					break;
				case '$':
					mem[p++] = LDAV;
					addInt(arg1.substr(1), 8);
					break;

					// TODO add support for paged addresses
				default:
					mem[p++] = LDAA;
					addInt(arg1, 16, true);
					break;
			}
			// move into dest
			switch (arg2[0]) {
				case '%':
					// into register
					mem[p++] = STR;
					addReg(arg2);
					break;
				default:
					// into address
					mem[p++] = STA;
					addInt(arg2, 16, true);
					break;
			}
		} else if (op === 'CMP') {
			// compare two values

		} else if (op === "JMP") {
			// jump to an address, first we load the address into the accumulator
			if (arg1[0] === '.') {
				mem[p++] = LDAA;
				addNamedAddress(arg1);
			} else {
				mem[p++] = LDAA;
				addInt(arg1, 16, true)
			}
			mem[p++] = JMP;
		} else if (op == "JSR") {
			// store the current address
			mem[p++] = LDAV;
			mem[p++] = addInt(p++, 16, true);
			mem[p++] = STA;
			mem[p++] = 0x00;
			mem[p++] = 0x01;
			// jump to the new address
			// first we load the accumulator with the target address
			mem[p++] = LDAV;
			switch (arg1[0]) {
				case '.':
					addNamedAddress(arg1);
					break;
				default:
					addInt(arg1, 16, true);
			}
			mem[p++] = JMP;
		} else if (op == "RET") {
			mem[p++] = LDAA;
			mem[p++] = 0x00;
			mem[p++] = 0x01;
			mem[p++] = JMP;
		} else if (op == "LGI") {
			switch (arg1[0]) {
				case '$':
					mem[p++] = LGIV;
					addInt(arg1.substr(1), 8);
					break;
				case '%':
					mem[p++] = LGIR;
					addReg(arg1);
					break;
				default:
					mem[p++] = LGIA;
					addInt(arg1, 16);
					break;
			}
		} else if (op == "LGS") {
			mem[p++] = LGS;
			// we log everything after the instruction
			arg1 = line.replace("LGS", "").trim();
			if (arg1.length > 0xFF) throw te.sprintf("LGS string literal too large, max size 255. Recieved: {0}", arg1);
			// store the length of the string
			mem[p++] = arg1.length;
			// store the char
			for (j = 0; j < arg1.length; j++) {
				var cc = arg1.charCodeAt(j);
				if (cc > 0xFF) throw te.sprintf("LGS recieved an invlid character. All char codes must be less than 8 bits. Recieved {0}", arg1[j]);
				mem[p++] = cc;
			}
		} else {
			throw te.sprintf('Uknown instruction: {0}', op);
		}
	}

	function addInt(num /*str*/ , bits /*8 or 16*/ , isAddress /*bool*/ ) {
		// TODO think about accepting base 10 numbers too, we would need to parse them differently
		if (num.substr(0, 2) != "0x") {
			throw te.sprintf("int not HEX based. Recieved {0}", num);
		}
		if (bits !== 8 && bits !== 16) {
			throw te.sprintf("Invalid bits value, expected 8 or 16. Recived {0}", bits);
		}

		num = parseInt(num, 16);
		if (bits === 8 && num > 0xFF) {
			throw te.sprintf("int overflow, recieved {0} as a 8 bit value", num);
		}
		if (bits === 16 && num > 0xFFFF) {
			throw te.sprintf("int overflow, recieved {0} as a 16 bit value", num);
		}

		if (isAddress && num >= mem.length) {
			throw te.sprintf("Out of bounds address, recieved {0} but only {1} addresses", num, mem.length);
		}

		pushInt(num, bits);
	}

	function pushInt(num /*int*/ , bits) {
		if (bits === 8) {
			mem[p++] = num;
		} else {
			// 16 bit needs to be split across two addresses
			mem[p++] = num >> 8;
			mem[p++] = num | 256;
		}
	}

	function addReg(reg) {
		reg = reg.toLowerCase();
		if (registers[reg] === undefined) {
			throw te.sprintf("Unknown register, expected %rx, %ry, or %ra. Recieved {0}", reg);
		}
		mem[p++] = registers[reg];
	}

	function addNamedAddress(name) {
		if (named_address[name] !== undefined) {
			pushInt(named_address[name], 16);
		} else {
			if (!missing_named[name]) {
				missing_named[name] = [];
			}
			// save the mem location it needs to be placed
			missing_named[name].push(p);
			// NUL out two memory locations where we expect this address to be inserted
			mem[p++] = NUL;
			mem[p++] = NUL;
		}
	}
}
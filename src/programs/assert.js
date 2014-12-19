// This is an auto generated file. Do not edit.
// Source file: assert.asm
// Built on: 2014-12-19T00:48:06.316Z

"use strict";

te.provide("te.programs");

te.programs.newAssertProgram = function() {
	var _ = "";
	_ += "ASR $0x01 $0x01\n";
	_ += "ASR $0x01 $0x01\n";
	_ += "ASR $0xFF $0xFF\n";
	_ += "ASN $0x01 $0x02\n";
	_ += "ASN $0x01 $0xFF\n";
	_ += "ASN $0x00 $0xFF\n";
	_ += "MOV $0x08 %rx\n";
	_ += "ASR %rx $0x08\n";
	_ += "ASN %rx $0x78\n";
	_ += "MOV $0x77 %ry\n";
	_ += "ASR %ry $0x77\n";
	_ += "ASN %ry $0x78\n";
	_ += "MOV $0x02 0xFF00\n";
	_ += "ASR 0xFF00 $0x02\n";
	_ += "ASN 0xFF00 $0x78\n";
	_ += "MOV $0x03 0xFF01\n";
	_ += "ASR 0xFF01 $0x03\n";
	_ += "ASN 0xFF01 $0x78\n";
	_ += "JMP .foo\n";
	_ += ".foo\n";
	_ += "LGS Hello, world\n";
	_ += "LGS Now testing LGI. Should see '3' printed 4 times\n";
	_ += "LGI $0x03\n";
	_ += "MOV $0x03 0xFF\n";
	_ += "LGI 0xFF\n";
	_ += "MOV $0x03 0xA100\n";
	_ += "LGI 0xA100\n";
	_ += "MOV $0x03 %rx\n";
	_ += "LGI %rx\n";

	return _;
};
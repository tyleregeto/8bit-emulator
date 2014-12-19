// This is an auto generated file. Do not edit.
// Source file: hello.asm
// Built on: 2014-12-19T00:48:06.320Z

"use strict";

te.provide("te.programs");

te.programs.newHelloProgram = function() {
	var _ = "";
	_ += "MOV %RX 1\n";
	_ += "MOV %RY 1\n";
	_ += "MOV %RA 0xFF\n";
	_ += "JMP .draw_char\n";
	_ += "ADD 1 %RX\n";
	_ += "MOV %RA 0xFF\n";
	_ += "JMP .draw_char\n";

	return _;
};
// This is an auto generated file. Do not edit.
// Source file: bouncing_ball.asm
// Built on: 2014-12-19T00:48:06.319Z

"use strict";

te.provide("te.programs");

te.programs.newBouncing_ballProgram = function() {
	var _ = "";
	_ += "jmp .loop\n";
	_ += ".loop\n";
	_ += "jsr .moveball\n";
	_ += "jsr .delay\n";
	_ += "jmp .loop\n";
	_ += ".moveball\n";
	_ += ".jmr\n";
	_ += ".delay\n";
	_ += ".jmr\n";

	return _;
};
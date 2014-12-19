// The comupter glues all the piecse together and defines some globals

// makes a computer that is sorta comparible to a commodore64
function newComputer() {
	var PRG_MEM_START = 0x2328; // 9000
	var CHR_MEM_START = 0x40; // 64
	var MEM_SIZE = 0xFFFF;

	var mem = newMemoryUnit(MEM_SIZE);

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

	var cpu = newCpuUnit(mem.mem, PRG_MEM_START);
	var ghx = newGraphicsUnit(mem);

	// same screen res as commordore64
	var scr = newScreenUnit(mem, 320, 200, true);

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
	ghx.drawSymbol(CHR_MEM_START + (8 * 7), 1, 1); //h
	ghx.drawSymbol(CHR_MEM_START + (8 * 4), 2, 1); //e
	ghx.drawSymbol(CHR_MEM_START + (8 * 11), 3, 1); //l
	ghx.drawSymbol(CHR_MEM_START + (8 * 11), 4, 1); //l
	ghx.drawSymbol(CHR_MEM_START + (8 * 14), 5, 1); //o

	newClock([cpu, scr], 1 /*1000 / 30*/ );

	return {
		loadProgram: loadProgram
	};

	function loadProgram(src /*string*/ ) {
		te.asm.compile(PRG_MEM_START, mem.mem, src);
	}
}
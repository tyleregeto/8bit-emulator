// A memory unit is our RAM

function newMemoryUnit(size /*int, size of memory in bytes */ ) {
	// array of bytes, 8 bits per bytes, values of 0-255
	var mem = new Uint8Array(size);
	// default to zero value.
	for (var i = 0; i < size; i++) {
		//mem[i] = 0;
	}

	// interface to the memory unit
	return {
		mem: mem,

		get: function(loc /*int*/ ) {
			// TODO support memory overflow, anything biiger than size wraps backround zero
			return mem[loc];
		},
		set: function(loc, val) {
			// TODO support memory overflow
			mem[loc] = val;
		},
		// loads a chunck of data into memory at the given location
		load: function(p /*int, pointer to loc to load into*/ , arr /*arr of Uint8*/ ) {
			for (var i = 0; i < arr.length; i++) {
				mem[p + i] = arr[i];
			}
		},
		// copies `len` bytes in memory from s to e
		// does not modify s.
		copy: function(s, e, len) {
			for (var i = 0; i < len; i++) {
				mem[e + i] = mem[s + i];
			}
		}
	};
}
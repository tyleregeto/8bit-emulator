"use strict";

var path = require('path')
var grunt = require("grunt");
grunt.file.defaultEncoding = 'utf8';

function compileAsmToJs() {
	var pattern = this.data.pattern;
	var files = grunt.file.expand(pattern);
	var tmpl = grunt.file.read("src/programs/program.js.tmpl");

	files.forEach(function(filepath) {
		// skip files that don't exist
		if (!grunt.file.exists(filepath)) {
			grunt.log.warn('Source file "' + filepath + '" not found.');
			return;
		}

		var program = grunt.file.read(filepath);
		var filename = path.basename(filepath, '.asm')
		var t = tmpl;
		t = t.replace("%BUILD_DATE%", new Date().toISOString());
		t = t.replace("%SRC_FILE%", filename + ".asm");
		t = t.replace("%PROGRAM_NAME%", upFirst(filename));
		t = t.replace("%PROGRAM%", convertProgram(program));

		grunt.file.write(filepath.replace(".asm", ".js"), t);
	});
}

function upFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function convertProgram(src) {
	var res = '';
	var lines = src.split('\n');
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i].trim();

		if (line.length === 0) {
			continue;
		}

		if (line[0] === "#") {
			continue;
		}

		res += '\t_ += "' + line + '\\n";\n';
	}
	return res;
}

var buildSpec = {
	concat: {
		js: {
			src: [
				'src/core.js',
				'src/clock.js',
				'src/compiler.js',
				'src/cpu.js',
				'src/mem.js',
				'src/screen.js',
				'src/input.js',
				'src/computer.js',
				//
				'src/programs/hello.js',
				'src/programs/math.js',
				'src/programs/opts_tests.js',
				'src/programs/assert.js'
			],
			dest: 'build/main.js'
		}
	},
	translate_asm_to_js: {
		compile: {
			pattern: 'src/**/*.asm'
		}
	},
	watch: {
		scripts: {
			files: ['src/**/*.js', 'src/**/*.asm'],
			tasks: ['default'],
			options: {
				spawn: false,
			},
		},
	}
};

module.exports = function(grunt) {
	grunt.initConfig(buildSpec);

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerMultiTask('translate_asm_to_js', compileAsmToJs)

	grunt.registerTask('default', ['translate_asm_to_js', 'concat'])
};
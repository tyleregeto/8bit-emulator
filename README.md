A 8 bit computer emulator, in JS
=============

This is a work in progress.

Memory Layout
-----------------

0x00 is a reserved empty address. It has no meaning. \
0x01 contains the address of the last call to JSR + 1 instruction. RET  uses this value. \
0x02 contains the result of CMP. \
0x03-0x003F is reserved for flags. \
0x40-0x009F is reserved for native font graphics (0x0040 is 'A', 0x0041 is 'B'). \
0xA0-0x1FE0 is screen memory. Each bit is an on/off pixel. This is 8000 bytes long, 64000 pixels.

The Assembly Language Spec
=============

Comments
-----------------
Comments are indicated by a `#` sign. The pound sign must be the first character in the line (white space is trimmed). There are no block comments.

```asm
# this is a comment
MOV %ry %rx # this is an _invalid_ comment, comments must begin the line
```

Numbers
-----------------
Numbers are always specified in hexadecimal, prefixed by `0x`. Numbers can be 8 or 16 bits depending on the context, but 8 bit is the most common.

```asm
# a 8 bit number
0x01
# a 16 bit number
0xFF00
```

Values
-----------------
*Literal values* are always prefixed with a `$` sign, and specified in HEX. Values are always 8 bits long.

$0x01 is valid \
$0xFF is valid \
$0xFF01 is invalid because it is over 8 bits. The compiler will throw an error.

*Register values* are always prefixed with `%`. There are two general purpose registers, `%rx` and `%ry`. They are case in-sensitive. Registers can store up to 16 bits.

```asm
# example using a register value
MOV $0xFF %rx
```

*Memory addresses* have no prefix, and are always specified in hexadecimal. Addresses can be either 8 bit or 16 bit values, the compiler will optimize memory based on which one is used.

```asm
# Example of moving the literal value 0x01 into the memory location 0xF0. Once compiled this memory address takes up 8 bits.
MOV $0x01 0xF0

# Example of a 16 bit memory address
MOV $0x01 0xFF01

# Here the address is specified as 16 bit, but the compiler optimizes it at compile time to only take up 8 bits.
MOV $0x01 0x00FF
```

Named addresses
------------------
*Named addresses* are a special type of value. They are a place holder for a memory address that will be determined at compile time. They are used by the jump and branching instructions. A named address is always relative to a programs start location in memory.

Named address are useful for controlling the flow of an application. Combined with the JMP instruction, you can jump to a different position in the code execution.

```asm
# The assertion that 1 == 2 never runs, the line is skipped over.
JMP .loop
ASR $0x01 $0x02
.loop
```

Named memory addresses do not translate into a machine instruction during compilation. They are a compile time value only. This means that the following two code examples are exactly equvilent once translated into machine language.

```asm
ASR 0xFF 0xFF
.foo
ASR 0xFF 0xFF
```
And
```asm
ASR 0xFF 0xFF
ASR 0xFF 0xFF
```

JMP
------------------
The *JMP* (jump) instruction can be used to control the execution of code. JMP takes one argument which is a memory address. This will change the code execution pointer to a different part of the memory and start running the portion of the program that exists there.

JMP is almost always used in conjunction with *named memory addresses*.

```asm
# JMP moves code execution to .bar declared below. The portion of the program contained between .foo and .bar will never execute.
JMP .bar

.foo
# A portion of the program lives here

.bar
# Another portion of the program lives here
```


MOV
------------------
TODO, these are implemented, just need to document

Asserts
-----------------------
The assembly instruction set includes two assert instructions, these are for general debugging.

*ASR* asserts the a value is true. It takes two arguments, whose values are compared against each other numerically. The first argument can be a literal, register, or address. The second argument literal. Literals can be 8 or 16 bit in either argument.

```asm
# assert that 1 is equal to itself
ASR $0x01 $0x01

# assert that 255 is equal to itself
ASR $0xFF00 $0xFF00

# assert that value in register _rx_ is equal to 1
ASR %rx $0x01

# assert that value in memory location 0x00FF is equal to 1
ASR 0x00FF $0x01
```

*ASN* assert that a value is _not_ true. Its argument rules are the same as *ASR*.

```asm
# assert that 1 is not equal to 2
ASN $0x01 $0x02
```

Logs
-----------------
There is a small set of logging instructions useful for debug purposes. You can log literal numbers, literal strings, registers, or addresses.

*LGS* prints a string literal to console.log(). Each individual character code must be less than 8 bits, the compiler tests for this. Char bit size is based on the environments implementation of the javascript method string.charCodeAt(pos)

The max length of a string literal is 255 characters.

```asm
# logs the string 'Hello, world' to the browser console
LGS Hello, world
```

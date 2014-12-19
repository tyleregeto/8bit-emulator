# hello.asm
# Writes "Hello, world!" to the screen"

# set start row col
MOV %RX 1
MOV %RY 1

# set character to draw
MOV %RA 0xFF

# call routine draw routine
JMP .draw_char

# Increase col by one, set new char, call next draw
ADD 1 %RX
MOV %RA 0xFF
JMP .draw_char


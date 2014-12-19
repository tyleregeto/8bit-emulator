# verify that assert functionality works

# TODO if the very first instruction is num literal, it signifies the compile memory location to use
# this istruction is invalid otherwise and throws error
# PRS $0xFF
# TODO think of adding name information here to that can be used by the OS

# assert that number equal themselves
ASR $0x01 $0x01
ASR $0x01 $0x01
ASR $0xFF $0xFF

# assert that numbers do NOT equal other numbers
ASN $0x01 $0x02
ASN $0x01 $0xFF
ASN $0x00 $0xFF

# assert move comamnds
# move into registers
MOV $0x08 %rx
ASR %rx $0x08
ASN %rx $0x78

MOV $0x77 %ry
ASR %ry $0x77
ASN %ry $0x78

# move value into 8 bit address
MOV $0x02 0xFF00
ASR 0xFF00 $0x02
ASN 0xFF00 $0x78

# move to 16 bit addresses
MOV $0x03 0xFF01
ASR 0xFF01 $0x03
ASN 0xFF01 $0x78

# test named addresses
# the line after the JMP should not ever run
JMP .foo
#ASR $0x01 $0x02
.foo
#MOV $0x04 0xFF02
#ASR 0xFF02 $0x04

# jump set value, then return to assert
# JSR .setval
# .assert
# ASR 0xA1 $0x02
# JMP .complete
# .setval
# MOV $0x02 0xA1
# RET
# .complete





# run log commands, these don't get asserted.
# we just run them to see any thrown errors.
LGS Hello, world
LGS Now testing LGI. Should see '3' printed 4 times
LGI $0x03

MOV $0x03 0xFF
LGI 0xFF

MOV $0x03 0xA100
LGI 0xA100

MOV $0x03 %rx
LGI %rx
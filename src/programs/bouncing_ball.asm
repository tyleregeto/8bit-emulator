# a ball that bounces around the edged of the screen

jmp .loop

.loop
	jsr .moveball
	jsr .delay
	jmp .loop

# moves the ball position, bounces on collision
.moveball
	# TODO
	.jmr


# TODO delay clock so game loop isnt too fast
.delay
	.jmr
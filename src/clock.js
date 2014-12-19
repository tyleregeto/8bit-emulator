// A simple "clock" calls tick on any number of objects
// at a fixed interval.

function newClock(arr, rate) {
	setInterval(function() {
		for (var i = 0; i < arr.length; i++) {
			arr[i].tick();
		}
	}, rate);
}
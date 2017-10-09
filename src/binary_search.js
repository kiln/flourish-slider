// Binary search
export default function closestValue(sorted_list, value, a, b) {
	if (typeof a === "undefined") a = 0;
	if (typeof b === "undefined") b = sorted_list.length;

	if (b-a == 0) return value;
	if (b-a == 1) return sorted_list[a];
	if (b-a == 2) {
		var d1 = Math.abs(sorted_list[a] - value),
		    d2 = Math.abs(sorted_list[a+1] - value);
		if (d1 <= d2) return sorted_list[a];
		else return sorted_list[a+1];
	}

	var mid = a + Math.floor((b-a) / 2),
	    mid_v = sorted_list[mid]
	    pre = mid - 1,
	    pre_v = sorted_list[pre];
	if (pre_v <= value && value <= mid_v) {
		return (Math.abs(pre_v - value) <= Math.abs(mid_v - value)) ? pre_v : mid_v;
	}
	if (mid_v <= value) return closestValue(sorted_list, value, mid, b);
	else return closestValue(sorted_list, value, a, mid);
}

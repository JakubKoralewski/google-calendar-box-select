interface Set<T> {
	union(otherSet: Set<T>): Set<T>;
}

Set.prototype.union = function(setB: Set<any>): Set<any> {
	const union = new Set(this);
	for (const elem of setB) {
		union.add(elem);
	}
	return union;
};

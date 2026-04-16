/**
 * Misc object utilities
 */

/**
 * Extend an object with the properties of another object
 * @param {Object} base
 * @param {Object} plugin
 */
export function extend (base, plugin, { deep, ignore = ["constructor", "prototype"] } = {}) {
	if (deep && !(deep instanceof Set)) {
		deep = new Set(deep);
	}

	if (ignore && !(ignore instanceof Set)) {
		ignore = new Set(ignore);
	}

	let descriptors = Object.getOwnPropertyDescriptors(plugin);
	for (let property of Reflect.ownKeys(descriptors)) {
		if (deep?.has(property)) {
			extend(base[property], plugin[property], { deep, ignore });
			continue;
		}
		else if (ignore?.has(property)) {
			continue;
		}

		// TODO how to handle conflicts?
		// TODO handle data properties separately?
		Object.defineProperty(base, property, descriptors[property]);
	}
}

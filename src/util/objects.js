/**
 * Misc object utilities
 */

/**
 * Extend an object with the properties of another object
 * @param {Object} base
 * @param {Object} plugin
 */
export function extend (base, plugin) {
	// TODO how to handle conflicts?
	// TODO handle data properties separately?
	let descriptors = Object.getOwnPropertyDescriptors(plugin);
	Object.defineProperties(base, descriptors);
}

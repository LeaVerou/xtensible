/**
 * Misc string utilities
 */

export function toUnderscoreCase (name) {
	return name.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/-/g, "_");
}

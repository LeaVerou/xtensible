/**
 * Plugin to add public API for installing or checking installed plugins
 */
import { addPlugin, hasPlugin, plugins } from "../src/plugins.js";

const provides = {
	constructor: {
		get installedPlugins () {
			return this[plugins];
		},

		hasPlugin (plugin) {
			return hasPlugin(this, plugin);
		},

		addPlugin (...plugin) {
			addPlugin(this, ...plugin);
		},

		addPlugins (...plugin) {
			addPlugin(this, ...plugin);
		},
	},
};

const hooks = {
	setup () {
		// Install any plugins in Class.plugins
		if (!Object.hasOwn(this, "plugins")) {
			return;
		}

		for (let plugin of this.plugins) {
			addPlugin(this, plugin);
		}
	},
};

export default { provides, hooks };

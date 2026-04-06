/**
 * The plugin that makes a class support plugins
 * So meta!
 */

import Hooks, { hooks } from "../src/hooks.js";
import { defineOwnProperty } from "../src/util/own.js";

const provides = {
	$hook (name, env, options) {
		this.constructor[hooks].run(name, env, { context: this, ...options });
	},

	constructor: {
		$hook (name, env, options) {
			this[hooks].run(name, env, { context: this, ...options });
		},

		get hooks () {
			return this[hooks];
		},
	},
};

// Ensures that each class has its own hooks object
defineOwnProperty(provides.constructor, hooks, function () {
	return new Hooks(this);
});

export default { provides };

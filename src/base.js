/**
 * The plugin that makes a class support plugins
 * So meta!
 */

import Hooks from "../hooks.js";
import { getSuperMethod } from "../util/super.js";
import { defineOwnProperty } from "../util/own.js";

const provides = {
	$hook (name, env, options) {
		this.constructor.hooks.run(name, env, { context: this, ...options });
	},
};

	constructor: {
		$hook (name, env, options) {
			this.hooks.run(name, env, { context: this, ...options });
		},

		/**
		 * Code initializing the class that needs to be called as soon as possible after class definition
		 * And needs to be called separately per subclass
		 * @returns {void}
		 */
		setup () {
			// super.setup()
			getSuperMethod(this, provides.constructor.setup)?.call(this);

			// TODO what about plugins that were added after setup was called?
			this.$hook("setup", this, { once: true });
		},
	},
};

// Ensures that each class has its own hooks object
defineOwnProperty(provides.constructor, "hooks", function () {
	return new Hooks(this);
});

export default { provides };

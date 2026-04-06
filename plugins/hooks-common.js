import { getSuperMethod } from "../util/super.js";
import $hook from "./$hook.js";

export const dependencies = [$hook];

const provides = {
	// Called by the constructor
	constructed () {
		// super.constructed?.()
		getSuperMethod(this, provides.constructed)?.call(this);

		this.constructor.setup(); // Last resort
		this.constructor.$hook("constructor-static");
		this.$hook("constructor");

		// We use a microtask so that this executes after the subclass constructor has run as well
		Promise.resolve().then(() => {
			this.$hook("constructed", undefined, { once: true });
		});
	},

	constructor: {
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

export default { dependencies, provides };

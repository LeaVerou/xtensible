/**
 * Adds `$super` properties that work like super, but are dynamically bound and thus, can be used from plugins.
 */

import { getSuper } from "../src/util/super.js";

const provides = {
	get super () {
		// TODO maybe return a proxy that calls getSuper(, memberName)? Or is that too much magic?
		return getSuper(this);
	},

	constructor: {
		get super () {
			return getSuper(this);
		},
	},
};

export default { provides };

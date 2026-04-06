import { getSupers, getSuper } from "./util/super.js";
import { toUnderscoreCase } from "./util/strings.js";
import Hook from "./hook.js";

export default class Hooks {
	/** @type {Map<string, Hook>} */
	hooks = new Map();

	/**
	 * The object this hooks object is attached to.
	 * It is expected that this.owner.hooks === this
	 * @type {object | null}
	 */
	owner = null;

	constructor (owner) {
		this.owner = owner;
	}

	/**
	 * Schedule one or more callbacks to be executed on one or more hooks
	 *
	 * @overload
	 * @param {string} name
	 * @param {function} callback
	 * @void
	 *
	 * @overload
	 * @param {Record<string, function>} hooks
	 * @void
	 */
	add (name, callback) {
		if (!name) {
			return;
		}

		if (Array.isArray(name)) {
			// Same callbacks for multiple hooks
			// Or multiple objects
			for (let hook of name) {
				this.add(hook, callback);
			}
		}
		else if (!callback) {
			if (typeof name === "object") {
				// Adding multiple hooks at once
				let hooks = name;

				for (let name in hooks) {
					this.add(name, hooks[name]);
				}
			}
		}
		else if (Array.isArray(callback)) {
			// Multiple callbacks for a single hook
			for (let cb of callback) {
				this.add(name, cb);
			}
		}
		else {
			// Single hook, single callback
			let resolved = Hooks.resolve(name);
			let hook = this.hooks.get(resolved.name);
			if (!hook) {
				hook = new Hook(this);
				this.hooks.set(resolved.name, hook);
			}

			hook.set(callback, resolved.options);
		}
	}

	/**
	 * Execute all callbacks on a specific hook
	 * @param {string} name
	 * @param {object} [env]
	 */
	run (name, env, options) {
		name = toUnderscoreCase(name);

		let Super = getSuper(this.owner);
		Super?.hooks?.run(name, env, options);
		let context = options?.context ?? env?.context ?? this.owner;
		let isStatic = typeof context === "function";

		let hook = this.hooks.get(name);

		if (isStatic) {
			env ??= {};
			env.originalContext = context;
			env.ownerContext = this.owner;

			if (context.prototype instanceof this.owner) {
				// Static hooks are run on subclasses too
				// starting from this.owner down to the entry class
				let supers = [this.owner, ...getSupers(context, this.owner)];

				for (let Super of supers) {
					hook?.run(env, options, Super);
				}
			}
		}

		hook?.run(env, options);

		if (name !== "*") {
			this.run("*", { hookName: name, env }, options);
		}
	}

	// Allow either camelCase, underscore_case or kebab-case for hook names
	static resolve (name) {
		let nameRaw = name;
		let options = {};

		// Convert to underscore_case
		name = toUnderscoreCase(name);

		if (name.startsWith("first_")) {
			options.once = true;
			name = name.slice(6);
		}

		return { nameRaw, name, options };
	}
}

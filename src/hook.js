export default class Hook extends Map {
	/**
	 * Track which contexts the hook has been run on so far
	 * @type {WeakMap<object, WeakSet<Function>>}
	 */
	contexts = new WeakMap();

	constructor (owner) {
		super();
		this.owner = owner;
	}

	run (env, options, forceContext) {
		let runContext = forceContext ?? options?.context;
		let fallbackContext = env?.context ?? this.owner.owner;

		for (let [callback, addOptions] of this) {
			let context = runContext ?? addOptions.context ?? fallbackContext;
			let once = options?.once ?? addOptions.once;
			let callbacks = this.contexts.get(context);
			if (once && this.hasRun(context, callback)) {
				continue;
			}

			callback.call(context, env);

			// TODO what about callbacks added after this?
			if (!callbacks) {
				callbacks = new WeakSet();
				this.contexts.set(context, callbacks);
			}
			callbacks.add(callback);
		}
	}

	/**
	 * Check if the hook has been run on a specific context and optionally a specific callback
	 * @param {object} context
	 * @param {function} [callback]
	 * @returns {boolean}
	 */
	hasRun (context, callback) {
		let callbacks = this.contexts.get(context);

		if (!callback || !callbacks) {
			// Check if the context has been run on at all
			return Boolean(callbacks);
		}

		return callbacks.has(callback);
	}
}

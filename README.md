# (E)xtensible

A lightweight, nearly zero-dependency\* plugin system for JavaScript classes.
Add elaborate plugin support to any class (or any JS object) — with automatic dependency resolution and inheritance support.

\* Only dependency is [`get-symbols`](https://github.com/AshleyScirworthy/get-symbols), a tiny symbol registry utility.

## Installation

```sh
npm install xtensible
```

## Quick Start

xtensible allows you to make your classes extensible so that consumers can do things like:

```js
import YourClass from "your-class";
import yourClassPlugin from "your-class-plugin";

YourClass.addPlugin(yourClassPlugin);
```

## Plugins

Each plugin can only be installed once per class, but can be installed separately on subclasses.

### Defining a plugin

A plugin is a plain object with any combination of these properties:

| Property       | Type       | Description                                                                                               |
| -------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| `provides`     | `object`   | Properties and methods added to the class prototype (instances) or the class itself (under `constructor`) |
| `hooks`        | `object`   | Callbacks keyed by hook name, run during lifecycle events                                                 |
| `dependencies` | `Plugin[]` | Plugins that must be installed first                                                                      |

```js
import otherPlugin from "other-plugin";

const myPlugin = {
	dependencies: [otherPlugin],
	provides: {
		greet () {
			return `Hi from ${this.constructor.name}`;
		},

		constructor: {
			// Static method!
			create (...args) {
				return new this(...args);
			},
		},
	},
	hooks: {
		setup () {
			/* runs whenever the class calls the "setup" hook */
		},
	},
};
```

### Installing plugins

Use `addPlugin()` to install one or more plugins on a class.
Dependency plugins are installed automatically.
Duplicate installations are silently skipped.

```js
import { addPlugin } from "xtensible";

addPlugin(MyClass, pluginA, pluginB);
```

You can check whether a plugin is already installed (including on superclasses):

```js
import { hasPlugin } from "xtensible";

hasPlugin(MyClass, pluginA); // true or false
```

You can expose `addPlugin()` as a static method on the class so that your consumers don't need to know about xtensible at all:

```js
import { addPlugin } from "xtensible";

class MyClass {
	// ...

	static addPlugin (plugin) {
		addPlugin(this, plugin);
	}
}
```

## Hooks

xtensible plugins can contain one or more of the following:

1. Provided properties, loosely inspired from the [first-class protocols](https://github.com/tc39/proposal-first-class-protocols) proposal.
2. Lifecycle hooks which allow a class to run code at specific points in its execution lifecycle.

Plugins only using provided members (1) can be installed on any class by simply calling `addPlugin(Class, plugin)` though classes may want to expose `addPlugin()` etc as static methods so that consumer don't need to know about xtensible at all.

However, for hooks to make sense, the class needs to actually define when they should run. E.g.:

```js
import { hooks } from "xtensible/hooks";

class MyElement extends HTMLElement {
	connectedCallback () {
		this[hooks].run("connected", this);
	}
}
```

Generally, hooks are useful when a plugin needs to extend what an existing method does or add side effects to it.
For example:

- Class creation
- Instance creation
- Common lifecycle events (e.g. `connectedCallback` for custom elements)

Some commonly useful hooks are:

- `setup` - runs once per class
- `constructor` - When the class constructor is called (sync)
- `constructed` - runs after an instance is constructed (including any subclass constructors)

xtensible hooks are an evolution of our earlier [blissful-hooks](https://npmjs.com/package/blissful-hooks) package, adapted to work well for deep class hierarchies (superclass hooks run first)
and support the more elaborate functionality we needed for [`nude-element`](https://npmjs.com/package/nude-element).

#### Hook name resolution

Hook names are normalized to `underscore_case`, so all of these are equivalent:

```js
"myHook"; // camelCase
"my-hook"; // kebab-case
"my_hook"; // underscore_case
```

#### Once-per-context hooks

Prefix a hook name with `first_` to run it only once per context (class or instance):

```js
hooks: {
	first_setup () {
		// Only runs the first time setup() is called on this class
	},
}
```

#### Wildcard hooks

Register a `"*"` hook to run on every hook invocation:

```js
this.hooks.add("*", function (env) {
	console.log(`Hook "${env.hookName}" fired`);
});
```

## Common plugins

Optionally, xtensible ships with a few tiny plugins that are useful for common use cases.

### `api` - Exposing a public API for plugins

xtensible is not very opinionated about how you expose your plugin system and does not add _any_ public API to your class by default.
If you want to expose public API for plugins (`installedPlugins`, `hasPlugin()`, `addPlugin()`), you can install the `api` plugin:

```js
import { addPlugin, pluginsApi } from "xtensible";

class YourClass {
	// ...
}

addPlugin(YourClass, pluginsApi);

YourClass.addPlugin(yourClassPlugin); // now works!
```

This also allows consumer subclasses to define a `plugins` array and have these plugins installed automatically when the subclass is constructed (if a `setup` hook is defined).

### `$hook` - Convenience `$hook()` method

If you find yourself defining a lot of hooks, you can install the `$hook` plugin to add a convenience instance and class method for running hooks.

```js
import { addPlugin, $hook } from "xtensible";

class YourClass {
	constructor () {
		// ...
		this.$hook("constructor", this);
	}

	static {
		addPlugin(this, $hook);
	}
}
```

### `hooks-common` - Common hooks

Supports common hooks for class creation, instance creation, and common lifecycle events:

- `constructor` - When the class constructor is called (sync)
- `constructed` - runs after an instance is constructed (including any subclass constructors)
- `setup` - runs once per class

The installing class does still need to call the provided `constructed()` method in its constructor and ideally classes should call `setup()` to trigger the `setup` hook earlier than the first instance is constructed.

### `$super` - Convenience `this.$super` property

TBD - Coming soon

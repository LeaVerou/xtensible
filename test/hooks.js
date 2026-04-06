import Hooks from "../src/hooks.js";

export default {
	name: "Hooks",
	tests: [
		{
			name: "add() & run()",
			tests: [
				{
					name: "Runs a single callback",
					run () {
						let result;
						class Owner { static hooks = new Hooks(this); }
						Owner.hooks.add("test", (env) => { result = env.value; });
						Owner.hooks.run("test", { value: 42 });
						return result;
					},
					expect: 42,
				},
				{
					name: "Runs multiple callbacks in order",
					run () {
						let results = [];
						class Owner { static hooks = new Hooks(this); }
						Owner.hooks.add("test", () => { results.push(1); });
						Owner.hooks.add("test", () => { results.push(2); });
						Owner.hooks.run("test", {});
						return results;
					},
					expect: [1, 2],
				},
				{
					name: "Adds multiple hooks via object",
					run () {
						let a, b;
						class Owner { static hooks = new Hooks(this); }
						Owner.hooks.add({
							hookA () { a = true; },
							hookB () { b = true; },
						});
						Owner.hooks.run("hook_a", {});
						Owner.hooks.run("hook_b", {});
						return [a, b];
					},
					expect: [true, true],
				},
			],
		},
		{
			name: "Hook name resolution",
			tests: [
				{
					name: "camelCase normalizes to underscore_case",
					run () {
						let resolved = Hooks.resolve("myHook");
						return resolved.name;
					},
					expect: "my_hook",
				},
				{
					name: "kebab-case normalizes to underscore_case",
					run () {
						return Hooks.resolve("my-hook").name;
					},
					expect: "my_hook",
				},
				{
					name: "first_ prefix sets once option",
					run () {
						let resolved = Hooks.resolve("first_setup");
						return { name: resolved.name, once: resolved.options.once };
					},
					expect: { name: "setup", once: true },
				},
			],
		},
		{
			name: "Wildcard hooks",
			run () {
				let hookNames = [];
				class Owner { static hooks = new Hooks(this); }
				Owner.hooks.add("*", (env) => { hookNames.push(env.hookName); });
				Owner.hooks.run("foo", {});
				Owner.hooks.run("bar", {});
				return hookNames;
			},
			expect: ["foo", "bar"],
		},
	],
};

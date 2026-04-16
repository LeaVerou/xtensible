import { addPlugin, hasPlugin, plugins } from "../src/plugins.js";

class Base {}

export default {
	name: "Plugins",
	tests: [
		{
			name: "addPlugin() & hasPlugin()",
			tests: [
				{
					name: "Installs a plugin",
					run () {
						class A {}
						let plugin = {};
						addPlugin(A, plugin);
						return hasPlugin(A, plugin);
					},
					expect: true,
				},
				{
					name: "Skips duplicate installation",
					run () {
						class A {}
						let plugin = {};
						addPlugin(A, plugin);
						addPlugin(A, plugin);
						return A[plugins].size;
					},
					expect: 1,
				},
				{
					name: "Installs dependencies first",
					run () {
						class A {}
						let dep = {};
						let plugin = { dependencies: [dep] };
						addPlugin(A, plugin);
						return hasPlugin(A, dep);
					},
					expect: true,
				},
				{
					name: "hasPlugin() checks superclass",
					run () {
						let plugin = {};
						addPlugin(Base, plugin);

						class Child extends Base {}
						return hasPlugin(Child, plugin);
					},
					expect: true,
				},
				{
					name: "hasPlugin() returns false for uninstalled plugin",
					run () {
						class A {}
						return hasPlugin(A, {});
					},
					expect: false,
				},
				{
					name: "Installs multiple plugins",
					run () {
						class A {}
						let p1 = {};
						let p2 = {};
						addPlugin(A, p1, p2);
						return [hasPlugin(A, p1), hasPlugin(A, p2)];
					},
					expect: [true, true],
				},
			],
		},
		{
			name: "provides",
			tests: [
				{
					name: "Adds prototype methods",
					run () {
						class A {}
						addPlugin(A, {
							provides: {
								greet () { return "hi"; },
							},
						});
						return new A().greet();
					},
					expect: "hi",
				},
				{
					name: "Adds static methods via constructor",
					run () {
						class A {}
						addPlugin(A, {
							provides: {
								constructor: {
									create () { return "created"; },
								},
							},
						});
						return A.create();
					},
					expect: "created",
				},
				{
					name: "Preserves prototype.constructor after deep merge",
					run () {
						class A {}
						addPlugin(A, {
							provides: {
								constructor: {},
							},
						});
						return new A().constructor === A;
					},
					expect: true,
				},
				{
					name: "Preserves symbol-keyed prototype methods",
					run () {
						const greet = Symbol("greet");
						class A {}
						addPlugin(A, {
							provides: {
								[greet] () {
									return "hi";
								},
							},
						});
						return new A()[greet]();
					},
					expect: "hi",
				},
			],
		},
	],
};

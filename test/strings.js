import { toUnderscoreCase } from "../src/util/strings.js";

export default {
	name: "toUnderscoreCase()",
	run: toUnderscoreCase,
	tests: [
		{ arg: "myHook", expect: "my_hook" },
		{ arg: "my-hook", expect: "my_hook" },
		{ arg: "my_hook", expect: "my_hook" },
		{ arg: "MyHook", expect: "my_hook", name: "Leading uppercase" },
		{ arg: "connectedCallback", expect: "connected_callback" },
		{ arg: "already_underscore", expect: "already_underscore" },
		{ arg: "a", expect: "a", name: "Single character" },
		{ arg: "ABCDef", expect: "a_b_c_def", name: "Multiple consecutive uppercase" },
	],
};

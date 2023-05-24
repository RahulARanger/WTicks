export function generateClassMethod(
	method_name: string,
	locator_path: string
): string {
	return [
		"\n\tget ",
		method_name,
		"(){\n",
		"\t\treturn ",
		`$("${locator_path}");`,
		"\n\t}",
	].join("");
}

export function generateClass(methods: Array<string>): string {
	if (!methods.length) return "";
	return ["\nclass Locators {", ...methods, "\n}\n"].join("");
}

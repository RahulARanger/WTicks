import { execSync } from "child_process";
import { readdirSync } from "fs";
import { describe, expect, test } from "@jest/globals";
import { resolve } from "path";

describe("Running the ensured tests in order to check if the results generated are correct", function () {
	const files = readdirSync(resolve(__dirname, "expectation"));

	test.each(files)("File Generated: $file", function (file) {
		const file_path = resolve(__dirname, "expectation", file);
		const text = execSync(`node "${file_path}"`, {
			env: { CI: "1", ...process.env },
		});

		expect(text).not.toBeNull();
		expect(text).not.toBeUndefined();
	});
});

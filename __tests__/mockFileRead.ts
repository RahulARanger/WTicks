import { readFileSync } from "fs";
import { resolve } from "path";

export function readMockData(fileName: string): string {
	return readFileSync(resolve(__dirname, "testData", fileName), "utf-8");
}

export function readExpectation(fileName: string): string {
	return readFileSync(
		resolve(__dirname, "expectation", fileName),
		"utf-8"
	).replaceAll("\r", "");
}

import { readFileSync } from "fs";
import { resolve } from "path";

export function readMockData(fileName: string): string {
	return readFileSync(resolve(__dirname, "testData", fileName), "utf-8");
}

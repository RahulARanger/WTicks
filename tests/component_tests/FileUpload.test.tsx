import React from "react";
import { expect, $ } from "@wdio/globals";
import { render, screen, fireEvent } from "@testing-library/react";
// TODO: Write some component tests
import * as matchers from "@testing-library/jest-dom/matchers";
expect.extend(matchers);

import UploadFile from "@/components/UploadFile";

describe("Verifying if the component accepts the file", function () {
	test("Verifying it with acceptable file", function () {
		render(
			<UploadFile
				dispatchDetails={() => {
					console.log("test");
				}}
			/>
		);
	});
});

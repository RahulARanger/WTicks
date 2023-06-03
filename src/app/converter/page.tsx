"use client";
import { Component, ReactNode } from "react";
import UploadFile from "@/components/UploadFile";
import {
	StandAloneScriptProps,
	StandAloneScriptState,
} from "@/types/homePageTypes";
import { ToStandaloneScript } from "@/theory/parser";
import Header from "@/components/header";
import Stack from "@mui/material/Stack";
import SimpleScriptViewer from "@/components/textArea";
import uploadFileStyles from "@/styles/uploadFile.module.sass";
import { InputStatus, OptionType, PatchForm } from "@/components/patchForm";
import { languages } from "prismjs";

export default class StandaloneScript extends Component<
	StandAloneScriptProps,
	StandAloneScriptState
> {
	state: StandAloneScriptState = {
		scriptGenerated:
			'console.info("Please complete the required info for generating the script ...");',
	};

	async parseRaw(data: string) {
		const parser = new ToStandaloneScript();
		parser.feed(data);
		if (!parser.isValidFile())
			throw new Error("Uploaded file is not a valid file");

		parser.parseAllTestCases();
		this.setState({ scriptParser: parser });
	}

	toGenerate(
		selectedOption: OptionType,
		locators: { [key: string]: InputStatus }
	) {
		const parser = this.state.scriptParser;
		if (!parser) return;

		Object.keys(locators).forEach((locator) => {
			if (!locators[locator]?.isError)
				parser.patchName(locator, locators[locator].text);
		});

		let test_cases;
		if (selectedOption.is_suite)
			test_cases = parser.parseSuite(selectedOption.value);
		else test_cases = parser.patchCommands(selectedOption.value);

		this.setState({
			scriptGenerated: parser.genScript(...Array.from(test_cases || [])),
		});
	}

	renderIfNotUploaded(): ReactNode {
		return <UploadFile dispatchDetails={this.parseRaw.bind(this)} />;
	}

	renderIfYetToParse(): ReactNode {
		return (
			<>
				<Stack className={uploadFileStyles.normallyInsidePage}>
					<Header parser={this.state.scriptParser} />
					<Stack
						flexDirection="row"
						sx={{
							flexGrow: 0.89,
							mt: "12px",
							pl: "6px",
							pr: "6px",
							columnGap: "10px",
						}}
					>
						{this.renderForPatching()}
						{this.renderScriptGenerated()}
					</Stack>
				</Stack>
			</>
		);
	}

	renderForPatching(): ReactNode {
		if (this.state.scriptParser)
			return (
				<PatchForm
					parser={this.state.scriptParser}
					toGenerate={this.toGenerate.bind(this)}
				/>
			);
		return <></>;
	}

	renderScriptGenerated(): ReactNode {
		return (
			<SimpleScriptViewer
				language={languages.javascript}
				languageString="javascript"
				script={this.state.scriptGenerated}
			/>
		);
	}

	render(): ReactNode {
		return (
			<>
				{!this.state.scriptParser
					? this.renderIfNotUploaded()
					: this.renderIfYetToParse()}
			</>
		);
	}
}

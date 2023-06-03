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
import { PatchForm } from "@/components/patchForm";
import { languages } from "prismjs";

export default class StandaloneScript extends Component<
	StandAloneScriptProps,
	StandAloneScriptState
> {
	state: StandAloneScriptState = {};

	async parseRaw(data: string) {
		const parser = new ToStandaloneScript();
		parser.feed(data);
		if (!parser.isValidFile())
			throw new Error("Uploaded file is not a valid file");

		parser.parseTestCases();
		this.setState({ scriptParser: parser });
	}

	renderIfNotUploaded(): ReactNode {
		return <UploadFile dispatchDetails={this.parseRaw.bind(this)} />;
	}

	renderIfYetToParse(): ReactNode {
		return (
			<>
				<Stack className={uploadFileStyles.normallyInsidePage}>
					<Header />
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
			return <PatchForm parser={this.state.scriptParser} />;
		return <></>;
	}

	renderScriptGenerated(): ReactNode {
		return (
			<SimpleScriptViewer
				language={languages.javascript}
				languageString="javascript"
				script={'console.info("Generating ...");'}
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

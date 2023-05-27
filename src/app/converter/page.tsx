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
import { TimelineComponent } from "@/components/timeline";
import { PatchForm } from "@/components/patchForm";

export default class StandaloneScript extends Component<
	StandAloneScriptProps,
	StandAloneScriptState
> {
	state: StandAloneScriptState = {};

	async parseRaw(data: string) {
		const parser = new ToStandaloneScript();
		parser.feed(data);
		if (!parser.isValidFile()) {
			throw new Error("Does not have required suites");
		}
		this.setState({ scriptParser: parser });
	}

	askOrConfirmForPatch(didWeParse: boolean) {
		const parser = this.state.scriptParser;
		if (!parser) return;

		if (didWeParse) this.setState({ needPatch: true });
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
						}}
					>
						{this.renderForPatching()}
						{this.renderStepsDone()}
					</Stack>
				</Stack>
			</>
		);
	}

	renderForPatching(): ReactNode {
		if (!this.state.scriptParser) return <></>;
		if (this.state.patched) return this.renderAfterParsed();
		if (!this.state.needPatch) return <></>;
		return <PatchForm parser={this.state.scriptParser} />;
	}

	renderAfterParsed(): ReactNode {
		return <></>;
	}

	renderStepsDone(): ReactNode {
		return (
			<TimelineComponent
				parser={this.state.scriptParser}
				patchThings={this.askOrConfirmForPatch.bind(this)}
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

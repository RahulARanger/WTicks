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
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import { languages } from "prismjs";
import editorTabStyles from "@/styles/textArea.module.sass";

export default class StandaloneScript extends Component<
	StandAloneScriptProps,
	StandAloneScriptState
> {
	state: StandAloneScriptState = { showDrawer: true };

	async parseRaw(data: string) {
		const parser = new ToStandaloneScript();
		parser.feed(data);
		if (!parser.isValidFile())
			throw new Error("Uploaded file is not a valid file");
		this.setState({ scriptParser: parser });
	}

	askOrConfirmForPatch() {
		if (!this.state.scriptParser) return;
		this.setState({ needPatch: true });
	}

	toggleDrawer(force?: boolean) {
		const drawerState = this.state.needPatch
			? true
			: force
			? true
			: !this.state.showDrawer;
		this.setState({ showDrawer: drawerState });
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
						{this.renderScriptGenerated()}
						{this.renderStepsDone()}
					</Stack>
				</Stack>
			</>
		);
	}

	renderForPatching(): ReactNode {
		if (
			this.state.scriptParser &&
			(this.state.patched || this.state.needPatch)
		)
			return (
				<PatchForm
					parser={this.state.scriptParser}
					closeDrawer={this.toggleDrawer.bind(this)}
					showDrawer={this.state.showDrawer}
				/>
			);
		return <></>;
	}

	renderScriptGenerated(): ReactNode {
		return (
			<Paper elevation={1}>
				<SimpleScriptViewer
					language={languages.javascript}
					languageString="javascript"
					script={'console.info("Generating ...");'}
				/>
			</Paper>
		);
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

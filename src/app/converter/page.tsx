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
import Box from "@mui/material/Box";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { languages } from "prismjs";
import editorTabStyles from "@/styles/textArea.module.sass";

export default class StandaloneScript extends Component<
	StandAloneScriptProps,
	StandAloneScriptState
> {
	state: StandAloneScriptState = { viewerIndex: "0", showDrawer: true };

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
						{this.showFiles()}
						{this.renderStepsDone()}
					</Stack>
				</Stack>
			</>
		);
	}

	toggleDrawer(force?: boolean) {
		const drawerState = this.state.needPatch
			? true
			: force
			? true
			: !this.state.showDrawer;
		this.setState({ showDrawer: drawerState });
	}

	renderForPatching(): ReactNode {
		if (!this.state.scriptParser) return <></>;
		return (
			<PatchForm
				parser={this.state.scriptParser}
				closeDrawer={this.toggleDrawer.bind(this)}
				showDrawer={this.state.showDrawer}
			/>
		);
	}

	shiftTab() {
		this.setState({
			viewerIndex: this.state.viewerIndex === "0" ? "1" : "0",
		});
	}

	showFiles(): ReactNode {
		const nameOfScript =
			(this.state.scriptParser?.parsed?.name || "*?") + ".spec.js";
		return (
			<Box
				sx={{ width: "100%", typography: "body1" }}
				className={editorTabStyles.tabView}
			>
				<TabContext value={this.state.viewerIndex}>
					<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
						<TabList
							onChange={this.shiftTab.bind(this)}
							aria-label="notepad for the reference scripts"
						>
							<Tab label=".side" value="0" />
							<Tab label={nameOfScript} value="1" disabled />
						</TabList>
					</Box>
					<TabPanel value="0" className={editorTabStyles.editorTab}>
						<SimpleScriptViewer
							language={languages.json}
							languageString="json"
							script={
								JSON.stringify(
									this.state.scriptParser?.parsed,
									null,
									4
								) || "{}"
							}
						/>
					</TabPanel>
					<TabPanel value="1" className={editorTabStyles.editorTab}>
						<SimpleScriptViewer
							language={languages.javascript}
							languageString="javascript"
							script={"{}"}
						/>
					</TabPanel>
				</TabContext>
			</Box>
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

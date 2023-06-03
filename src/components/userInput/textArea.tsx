import { Component, ReactNode } from "react";
import Paper from "@mui/material/Paper";
import { Grammar, highlight } from "prismjs";
import "prismjs/themes/prism-tomorrow.css"; // Import the desired Prism theme CSS file
import "prismjs/components/prism-javascript";
import textAreaStyles from "@/styles/converter/textArea.module.sass";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
// import Typography from "@mui/material/Typography";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Fab from "@mui/material/Fab";
import Snackbar from "@mui/material/Snackbar";
import { motion } from "framer-motion";
import Alert from "@mui/material/Alert";
import "prismjs/components/prism-json";
import { arise_from_bottom } from "@/motion/transactions";
import { CounterIcon } from "../errorsListBox";

interface LineNumberState {
	copied: boolean;
}

interface LineNumberProps {
	script: string;
	language: Grammar;
	languageString: string;
}

export default class SimpleScriptViewer extends Component<
	LineNumberProps,
	LineNumberState
> {
	state: LineNumberState = { copied: false };

	async copyScript() {
		try {
			await navigator.clipboard.writeText(this.props.script);
			this.setState({ copied: true });
		} catch (err) {
			console.log(err);
		}
	}

	async downloadScript() {
		const blob = new Blob([this.props.script], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "generatedScript.js";
		link.click();
		URL.revokeObjectURL(url);
	}

	async closeSnack() {
		this.setState({ copied: false });
	}

	render(): ReactNode {
		const closeSnack = this.closeSnack.bind(this);

		return (
			<>
				<Paper
					elevation={1}
					className={textAreaStyles.textArea}
					sx={{ flexGrow: 1 }}
				>
					<motion.div {...arise_from_bottom} layout>
						<pre className={textAreaStyles.preCode}>
							<code
								dangerouslySetInnerHTML={{
									__html: highlight(
										this.props.script,
										this.props.language,
										this.props.languageString
									),
								}}
								className={`language-${this.props.languageString} ${textAreaStyles.script}`}
							/>
						</pre>

						<Snackbar
							open={this.state.copied}
							autoHideDuration={3000}
							onClose={closeSnack}
							color="info"
							anchorOrigin={{
								vertical: "bottom",
								horizontal: "right",
							}}
						>
							<Alert
								onClose={closeSnack}
								severity="info"
								color="info"
								sx={{ width: "100%" }}
							>
								Copied to clipboard
							</Alert>
						</Snackbar>
					</motion.div>
				</Paper>
				<Stack className={textAreaStyles.icons}>
					<IconButton onClick={this.copyScript.bind(this)}>
						<ContentCopyIcon />
					</IconButton>
					<IconButton onClick={this.downloadScript.bind(this)}>
						<FileDownloadIcon />
					</IconButton>
					{/* <CounterIcon /> */}
				</Stack>
			</>
		);
	}
}

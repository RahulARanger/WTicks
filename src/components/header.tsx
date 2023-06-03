import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import headerStyles from "@/styles/header.module.sass";
import GitHubIcon from "@mui/icons-material/GitHub";
import { CounterIcon } from "./errorsListBox";
import { ToStandaloneScript } from "@/theory/parser";

interface ConverterHeaderProps {
	parser?: ToStandaloneScript;
}

interface ConverterState {
	logs: Array<LogType>;
}

interface LogType {
	isWarning: boolean;
	text: boolean;
}

export default class Header extends Component<
	ConverterHeaderProps,
	ConverterState
> {
	githubURL = "https://github.com/RahulARanger/wticks";
	state: ConverterState = { logs: [] };

	showLogs() {
		return <></>;
	}

	renderTitle(): ReactNode {
		return (
			<Stack flexDirection="row">
				<Typography variant="h6">WTicks</Typography>
			</Stack>
		);
	}

	renderTools(): ReactNode {
		return (
			<Stack flexDirection="row">
				<CounterIcon
					onClick={this.showLogs.bind(this)}
					count={this.state.logs.length}
				/>
				<IconButton href={this.githubURL} target="_blank">
					<GitHubIcon />
				</IconButton>
			</Stack>
		);
	}

	render(): ReactNode {
		return (
			<motion.div layout>
				<AppBar className={headerStyles.header}>
					<Toolbar className={headerStyles.toolbar}>
						<Stack
							flexDirection="row"
							justifyContent={"space-between"}
							flexGrow={1}
							alignItems="center"
						>
							{this.renderTitle()}
							{this.renderTools()}
						</Stack>
					</Toolbar>
				</AppBar>
			</motion.div>
		);
	}
}

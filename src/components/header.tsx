import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import headerStyles from "@/styles/header.module.sass";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Skeleton } from "@mui/material";

export default class Header extends Component<{ suites?: Array<string> }> {
	githubURL = "https://github.com/RahulARanger/wticks";

	renderTitle(): ReactNode {
		return (
			<Stack flexDirection="row">
				<Typography variant="h6">WTicks</Typography>
			</Stack>
		);
	}

	selectSuites(): ReactNode {
		return this.props.suites ? <></> : <Skeleton width="100px" />;
	}

	renderTools(): ReactNode {
		return (
			<Stack flexDirection="row">
				{this.selectSuites()}
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

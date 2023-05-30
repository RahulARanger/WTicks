import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { Component, ReactNode } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { ToStandaloneScript } from "@/theory/parser";
import { ShareDetails } from "@/theory/sharedTypes";
import ErrorIcon from "@mui/icons-material/Error";
import { motion } from "framer-motion";

interface Item {
	title: string;
	completed: boolean;
	description: string;
	failed?: boolean;
}

interface TimelineItems {
	mainItems: Array<Item>;
	resettableItems: Array<Item>;
}

interface TimelineProps {
	patchThings: () => void;
	parser?: ToStandaloneScript;
}

export class TimelineComponent extends Component<TimelineProps, TimelineItems> {
	state: TimelineItems = {
		mainItems: [
			{
				title: "Uploaded",
				completed: true,
				description: "File Uploaded",
			},
			{
				title: "Validation",
				completed: true,
				description: "File is valid",
			},
		],
		resettableItems: [],
	};

	renderTextItem(item: Item, opposite: boolean) {
		const details = (
			<>
				<Typography variant="subtitle1" component="span">
					{item.title}
				</Typography>
				<Typography variant="subtitle2" color="text.secondary">
					{item.description}
				</Typography>
			</>
		);

		return opposite ? (
			<TimelineContent sx={{ py: "12px", px: 2 }}>
				{details}
			</TimelineContent>
		) : (
			<TimelineOppositeContent
				sx={{ m: "auto 0" }}
				align="right"
				variant="body2"
			>
				{details}
			</TimelineOppositeContent>
		);
	}

	renderTimelineItem(item: Item, index: number) {
		return (
			<TimelineItem key={index}>
				{/* opposite content here if needed */}
				<TimelineSeparator>
					<TimelineConnector />
					<TimelineDot
						color={item.completed ? "grey" : "inherit"}
						variant={item.completed ? "outlined" : "filled"}
					>
						{item.completed ? (
							item.failed ? (
								<ErrorIcon color="error" />
							) : (
								<CheckCircleIcon color="success" />
							)
						) : (
							<CircularProgress size="25px" color="primary" />
						)}
					</TimelineDot>
					<TimelineConnector
						color={
							item.completed
								? item.failed
									? "error"
									: "success"
								: "warning"
						}
					/>
				</TimelineSeparator>
				{this.renderTextItem(item, true)}
			</TimelineItem>
		);
	}

	render() {
		return (
			<motion.div layout style={{ minWidth: "300px" }}>
				<Timeline position="alternate">
					{this.state.mainItems.map(
						this.renderTimelineItem.bind(this)
					)}
				</Timeline>
			</motion.div>
		);
	}

	juggleToMainItems() {
		this.state.mainItems.push(
			...this.state.resettableItems.splice(
				0,
				this.state.resettableItems.length
			)
		);
	}

	handleDispatchedItems(item: ShareDetails) {
		switch (item.type) {
			case "parsedTestCase": {
				// called only if the test case is failed
				this.state.resettableItems.push({
					completed: true,
					title: "Parse: Test Case",
					description: "Test Case: " + item.result,
				});
				break;
			}
			case "parsedTestCases": {
				const mainItem = this.state.mainItems.at(-1);
				if (mainItem) {
					mainItem.completed = true;
					mainItem.title = "Parse: Test Cases";
					mainItem.description = "Parsed required test cases";
				}
				this.juggleToMainItems();
				break;
			}
		}

		this.setState({
			resettableItems: this.state.resettableItems,
			mainItems: this.state.mainItems,
		});
	}

	componentDidMount(): void | Promise<void> {
		const parser = this.props.parser;
		if (!parser) return;

		parser.feedDispatcher(this.handleDispatchedItems.bind(this));

		this.state.mainItems.push({
			title: "Parsing",
			completed: false,
			description: "Parsing the test cases inside all the suites",
		});

		this.setState({ mainItems: this.state.mainItems });
		return new Promise((resolve) => {
			parser.parseTestCases();
			this.props.patchThings();
			resolve();
		});
	}
}

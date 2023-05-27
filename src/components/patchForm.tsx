import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { Component, RefObject, useRef, useState } from "react";
import { ToStandaloneScript } from "@/theory/parser";
import { alpha, styled } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import formStyles from "@/styles/form.module.sass";

interface FormState {
	index: number;
	showPendingAlone: boolean;
}

export const BootstrapInput = styled(TextField)(({ theme }) => ({
	"label + &": {
		marginTop: theme.spacing(3),
	},
	"& .MuiInputBase-input": {
		borderRadius: 4,
		position: "relative",
		backgroundColor: "#1A2027",
		border: "1px solid",
		borderColor: "#2D3843",
		fontSize: 16,
		width: "auto",
		padding: "10px 12px",
		transition: theme.transitions.create([
			"border-color",
			"background-color",
			"box-shadow",
		]),
		"& label.Mui-focused": {
			boxShadow: `${alpha(
				theme.palette.primary.main,
				0.25
			)} 0 0 0 0.2rem`,
			borderColor: theme.palette.primary.main,
		},
	},
}));

function AskVarName(props: {
	label: string;
	value: string;
	ref: RefObject<HTMLInputElement>;
}) {
	const [inputValue, setInputValue] = useState(props.value);
	function validateOnChange() {}

	return <BootstrapInput label={props.label} value={inputValue} required />;
}

export class PatchForm extends Component<
	{ parser: ToStandaloneScript },
	FormState
> {
	state: FormState = { index: 0, showPendingAlone: false };
	formTimeline() {
		return (
			<Stepper activeStep={this.state.index}>
				<Step sx={{ mr: "6px" }}>
					<StepLabel>Locators</StepLabel>
				</Step>
				<Step>
					<StepLabel>Methods</StepLabel>
				</Step>
			</Stepper>
		);
	}
	render() {
		return (
			<Paper
				sx={{
					p: "6px",
					display: "flex",
					flexDirection: "column",
					rowGap: "12px",
				}}
			>
				{this.formTimeline()}
				{this.state.index === 0
					? this.askForLocators()
					: this.askForMethods()}
			</Paper>
		);
	}

	askForLocators() {
		const locators = this.props.parser.locators;
		return (
			<FormControl className={formStyles.formBox}>
				<>
					<FormHelperText>
						Please fill the names of the locators.
					</FormHelperText>
					<FormControlLabel
						label="Filter Pending"
						control={
							<Switch
								checked={this.state.showPendingAlone}
								onChange={(_) => {
									this.setState({
										showPendingAlone:
											!this.state.showPendingAlone,
									});
								}}
							/>
						}
					/>
					<List className={formStyles.listContainer}>
						{Object.keys(locators)
							.filter((locator) =>
								this.state.showPendingAlone
									? !locators[locator]
									: true
							)
							.map((locator) => {
								return (
									<ListItem key={locator}>
										<BootstrapInput
											label={locator}
											defaultValue={
												this.props.parser.locators[
													locator
												]
											}
											required
										/>
									</ListItem>
								);
							})}
					</List>
					<Button>Next</Button>
				</>
			</FormControl>
		);
	}

	askForMethods() {
		return <></>;
	}
}
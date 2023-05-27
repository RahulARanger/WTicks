import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { Component } from "react";
import { Paper, Stack, TextField } from "@mui/material";
import { ToStandaloneScript } from "@/theory/parser";
import { alpha, styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { OutlinedInputProps } from "@mui/material/OutlinedInput";

interface FormState {
	index: number;
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

export class PatchForm extends Component<
	{ parser: ToStandaloneScript },
	FormState
> {
	state: FormState = { index: 0 };
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
			<Paper sx={{ p: "6px" }}>
				<Stack>
					{this.formTimeline()}
					{this.state.index === 0
						? this.askForLocators()
						: this.askForMethods()}
				</Stack>
			</Paper>
		);
	}

	askForLocators() {
		return (
			<FormControl>
				<>
					<Stack>
						{Object.keys(this.props.parser.locators).map(
							(locator) => {
								return (
									<BootstrapInput
										label={locator}
										defaultValue={
											this.props.parser.locators[locator]
										}
									/>
								);
							}
						)}
					</Stack>
				</>
			</FormControl>
		);
	}

	askForMethods() {
		return <></>;
	}
}

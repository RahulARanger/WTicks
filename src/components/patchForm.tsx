import { Component, RefObject, createRef } from "react";
import { ToStandaloneScript, test_var_name } from "@/theory/parser";
import { alpha, styled } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepButton from "@mui/material/StepButton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import Select from "@mui/material/Select";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import formStyles from "@/styles/form.module.sass";
import Drawer from "@mui/material/Drawer";
import InputTextField from "./inputElement";
import {
	Divider,
	Skeleton,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { ParsedTestCase, TestSuite } from "@/theory/sharedTypes";

interface InputStatus {
	text: string;
	isError?: boolean;
}

interface FormState {
	showPendingAlone: boolean;
	locators: { [key: string]: InputStatus };
	goodToGenerate: boolean;
	error?: string;
	selectedOption?: null | OptionType;
	activeStep: number;
}

interface FormProps {
	parser: ToStandaloneScript;
	showDrawer: boolean;
	closeDrawer: () => void;
}

interface OptionType {
	is_suite: boolean;
	label: string;
	value: string;
}

export class PatchForm extends Component<FormProps, FormState> {
	state: FormState = {
		showPendingAlone: false,
		locators: {},
		activeStep: 0,
		goodToGenerate: false,
		error: "Please select the test case",
	};

	constructor(props: FormProps) {
		super(props);
		for (let locator of Object.keys(props.parser.locators)) {
			const requested = this.parser().locators[locator];
			this.state.locators[locator] = {
				text: requested,
				isError: !test_var_name.test(requested),
			};
		}
		this.state.showPendingAlone =
			Object.keys(this.state.locators).length > 10;
	}
	// HELPER METHODS
	parser() {
		return this.props.parser;
	}

	didUserComplete(): boolean {
		return Boolean(this.state.goodToGenerate && this.state.selectedOption);
	}

	// validation or state changer methods
	identifyUnsavedChanges(text: string, locator: string, isError: boolean) {
		const locators = this.state.locators;
		locators[locator] = { text, isError };

		if (!this.state.goodToGenerate) return this.setState({ locators });

		const same = this.props.parser.locators[locator] === text;
		const so = isError ? false : same;
		const errorMsg = isError
			? "Error found in one of the input"
			: same
			? undefined
			: "Please verify before generating the script";

		this.setState({
			goodToGenerate: so,
			error: errorMsg,
			locators,
		});
	}

	verifySelection() {
		const locators = this.state.locators;
		const namesRequested = new Set();
		let isThereDuplicate = false;

		for (let locator of Object.keys(locators)) {
			const request = locators[locator].text;
			if (namesRequested.has(request)) {
				isThereDuplicate = true;
				break;
			}
			namesRequested.add(request);
		}

		this.setState({
			goodToGenerate: !isThereDuplicate,
			error: isThereDuplicate
				? "Please ensure we do not use duplicate names"
				: this.state.error,
			showPendingAlone: isThereDuplicate
				? true
				: this.state.showPendingAlone,
		});
	}

	renderSteps() {
		const labels = ["Assigning Names", "Script Configuration"];

		return (
			<Stepper nonLinear activeStep={this.state.activeStep}>
				<>
					{labels.map((label, index) => {
						return (
							<Step
								index={index}
								key={label}
								completed={this.didUserComplete()}
							>
								<StepButton
									onClick={() =>
										this.setState({ activeStep: index })
									}
								>
									{label}
								</StepButton>
							</Step>
						);
					})}
				</>
			</Stepper>
		);
	}

	renderOptions() {
		const suites = this.parser().parsed?.suites || [];
		const test_cases = Object.values(this.parser().parsedTestCases);

		const options: OptionType[] = [
			...suites.map((suite) => ({
				value: suite.id,
				label: suite.name,
				is_suite: true,
			})),
			...test_cases.map((testCase) => ({
				value: testCase.id,
				label: testCase.step_name,
				is_suite: false,
			})),
		];

		return (
			<Autocomplete
				id="grouped-demo"
				options={options}
				groupBy={(option) =>
					option.is_suite ? "Test Suites" : "Test Cases"
				}
				size={"small"}
				getOptionLabel={(option) => option.label}
				sx={{ width: 300, marginY: "10px", alignSelf: "stretch" }}
				renderInput={(params) => (
					<InputTextField
						label="Pick the Test case/suite to export"
						placeholder="Not yet selected"
						{...params}
					/>
				)}
				PaperComponent={(props) => (
					<Paper
						{...props}
						elevation={4}
						sx={{ border: "1.5px solid black" }}
					/>
				)}
				onChange={(_, value) =>
					this.setState({ selectedOption: value })
				}
			/>
		);
	}

	renderListItems() {
		const locators = this.parser().locators;
		const filtered = Object.keys(locators).filter((locator) =>
			this.state.showPendingAlone
				? this.state.locators[locator].isError
				: true
		);

		return (
			<>
				<FormControlLabel
					label={`Filter Pending [${filtered.length}]`}
					control={
						<Switch
							size="small"
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
					{filtered.map((locator) => {
						return (
							<ListItem key={locator} disableGutters>
								<InputTextField
									label={locator}
									defaultValue={locators[locator]}
									required
									placeholder="Not yet decided"
									regexToMaintain={test_var_name}
									sx={{ width: "100%" }}
									value={this.state.locators[locator].text}
									afterValidation={this.identifyUnsavedChanges.bind(
										this
									)}
								/>
							</ListItem>
						);
					})}
				</List>
			</>
		);
	}

	renderInputs(hasLocators: boolean) {
		return (
			<>
				{hasLocators ? (
					this.renderListItems()
				) : (
					<Typography
						variant="h6"
						color="paleturquoise"
						alignItems="center"
						flexGrow={1}
						sx={{ display: "flex" }}
						alignSelf="center"
					>
						No Locators found
					</Typography>
				)}
			</>
		);
	}

	askForLocators(hasLocators: boolean) {
		return (
			<>
				{this.renderOptions()}
				<Typography variant="subtitle1" sx={{ alignSelf: "stretch" }}>
					Please fill the names of the locators.
					<Divider variant="fullWidth" />
				</Typography>
				{this.renderInputs(hasLocators)}
			</>
		);
	}

	renderForm() {
		const locators = this.props.parser.locators;
		const savedLength = Object.keys(locators).length;
		const hasLocators = savedLength > 0;

		return (
			<FormControl className={formStyles.formBox}>
				<>
					{this.renderSteps()}
					{this.state.activeStep === 0 ? (
						this.askForLocators(hasLocators)
					) : (
						<></>
					)}
					<Stack flexDirection="row" columnGap={"12px"}>
						{hasLocators ? (
							<Button
								variant="outlined"
								color="secondary"
								onClick={this.verifySelection.bind(this)}
							>
								Verify
							</Button>
						) : (
							<></>
						)}
						<Tooltip title={this.state.error || "Generate Script"}>
							<span>
								<Button
									variant="outlined"
									disabled={
										!this.state.selectedOption ||
										!this.state.goodToGenerate
									}
								>
									Generate
								</Button>
							</span>
						</Tooltip>
					</Stack>
				</>
			</FormControl>
		);
	}

	render() {
		return (
			<Drawer
				anchor="left"
				open={this.props.showDrawer}
				onClose={this.props.closeDrawer}
			>
				<Paper
					sx={{
						p: "6px",
						display: "flex",
						flexDirection: "column",
						rowGap: "12px",
						height: "100%",
					}}
				>
					{this.renderForm()}
				</Paper>
			</Drawer>
		);
	}
}

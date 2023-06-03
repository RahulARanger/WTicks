import { Component } from "react";
import { ToStandaloneScript, test_var_name } from "@/theory/parser";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import formStyles from "@/styles/form.module.sass";
import InputTextField from "../userInput/inputElement";
import { motion, AnimatePresence } from "framer-motion";
import { Chip, Divider, Tooltip, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import InfoBox from "../infoBox";
// import { arise_from_bottom } from "@/motion/transactions";

export interface InputStatus {
	text: string;
	isError?: boolean;
}

interface FormState {
	showPendingAlone: boolean;
	locators: { [key: string]: InputStatus };
	goodToGenerate: boolean;
	error?: string;
	selectedOption?: null | OptionType;
}

interface FormProps {
	parser: ToStandaloneScript;
	toGenerate: (
		selected_type: OptionType,
		locators: { [key: string]: InputStatus }
	) => void;
}

export interface OptionType {
	is_suite: boolean;
	label: string;
	value: string;
}

export class PatchForm extends Component<FormProps, FormState> {
	state: FormState = {
		showPendingAlone: false,
		locators: {},
		goodToGenerate: false,
		error: "",
	};
	// HELPER METHODS
	parser() {
		return this.props.parser;
	}

	didUserComplete(): boolean {
		return Boolean(this.state.goodToGenerate && this.state.selectedOption);
	}

	parseTestCases(selectedOption: OptionType) {
		const parser = this.parser();
		const locators = selectedOption.is_suite
			? parser.parseSuiteCases(selectedOption.value)
			: parser.parseTestCases(selectedOption.value);

		const requestedLength = locators.size;
		const locators_to_be_state: { [key: string]: InputStatus } = {};

		locators.forEach((locator) => {
			const requested = parser.locators[locator];
			locators_to_be_state[locator] = {
				text: requested,
				isError: !test_var_name.test(requested),
			};
		});

		this.setState({
			showPendingAlone: requestedLength > 10,
			locators: locators_to_be_state,
			selectedOption,
		});

		console.log(this.state.locators);
	}

	genTooltipMessage(): string {
		return this.state.goodToGenerate && this.state.selectedOption
			? "Generate Script"
			: (!this.state.selectedOption
					? "Please select the test component"
					: "Please verify before generating") || this.state.error;
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
		let isThereError = false;
		const duplicates = new Set();

		const locator_keys = Object.keys(locators);

		// first loop is to collect the duplicate names
		locator_keys.forEach((locator) => {
			const request = locators[locator].text;
			if (namesRequested.has(request)) {
				isThereDuplicate = true;
				duplicates.add(request);
			}
			namesRequested.add(request);
		});

		// second loop is to mark the pending fields
		locator_keys.forEach((locator) => {
			const text = locators[locator].text;
			locators[locator].isError =
				duplicates.has(text) || !test_var_name.test(text);
			isThereError ||= !!locators[locator].isError;
		});

		this.setState({
			goodToGenerate: !isThereDuplicate && !isThereError,
			locators,
			error: isThereDuplicate
				? "Please ensure we do not use duplicate names"
				: isThereError
				? "Please rectify the error before verifying it"
				: this.genTooltipMessage(),
			showPendingAlone:
				isThereDuplicate || isThereError
					? true
					: this.state.showPendingAlone,
		});
	}

	renderMenuOptions(required?: boolean) {
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
				onChange={(_, value) => {
					if (value) return this.parseTestCases(value);
					this.setState({ selectedOption: value });
				}}
				open={required}
				forcePopupIcon={required ? false : undefined}
				value={this.state.selectedOption}
			/>
		);
	}

	renderListItems() {
		const locators = this.state.locators;
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
					<AnimatePresence mode="popLayout">
						<>
							{filtered.map((locator) => {
								return (
									<motion.div
										layout
										key={locator}
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{
											opacity: 0,
											scale: 0.5,
											transition: { duration: 0.2 },
										}}
										transition={{ duration: 0.5 }}
										whileHover={{
											scale: 1.02,
											transition: {
												duration: 0.2,
												type: "spring",
											},
										}}
									>
										<ListItem disableGutters>
											<InputTextField
												label={locator}
												required
												placeholder="Not yet decided"
												regexToMaintain={test_var_name}
												sx={{ width: "100%" }}
												value={
													this.state.locators[locator]
														.text
												}
												afterValidation={this.identifyUnsavedChanges.bind(
													this
												)}
											/>
										</ListItem>
									</motion.div>
								);
							})}
						</>
					</AnimatePresence>
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
					<InfoBox>
						<Chip
							label={
								<Typography color="paleturquoise">
									No Locators found
								</Typography>
							}
						/>
					</InfoBox>
				)}
			</>
		);
	}

	askForLocators(hasLocators: boolean) {
		return (
			<>
				{this.renderMenuOptions()}
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
		const message = this.genTooltipMessage();

		return (
			<>
				{this.askForLocators(hasLocators)}
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
					<Tooltip
						title={
							<Typography color="lightyellow" variant="caption">
								{message}
							</Typography>
						}
						arrow
						open={!!message}
					>
						<span>
							<Button
								variant="outlined"
								disabled={
									!this.state.selectedOption ||
									!this.state.goodToGenerate
								}
								onClick={() =>
									this.state.selectedOption &&
									this.props.toGenerate(
										this.state.selectedOption,
										this.state.locators
									)
								}
							>
								Generate
							</Button>
						</span>
					</Tooltip>
				</Stack>
			</>
		);
	}

	render() {
		return (
			<motion.article layout>
				<Paper
					sx={{
						p: "6px",
						display: "flex",
						flexDirection: "column",
						rowGap: "12px",
						height: "100%",
					}}
					elevation={2}
				>
					<FormControl style={{ height: "100%" }}>
						<motion.span
							className={formStyles.formBox}
							layout
							style={{ height: "100%" }}
						>
							{!this.state.selectedOption
								? this.renderMenuOptions(true)
								: this.renderForm()}
						</motion.span>
					</FormControl>
				</Paper>
			</motion.article>
		);
	}
}

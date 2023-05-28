import { Component, RefObject, createRef } from "react";
import { ToStandaloneScript, test_var_name } from "@/theory/parser";
import { alpha, styled } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
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
import { Divider, Skeleton, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { ParsedTestCase, TestSuite } from "@/theory/sharedTypes";

interface FormState {
	index: number;
	showPendingAlone: boolean;
	locators: { [key: string]: string };
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
	state: FormState = { index: 0, showPendingAlone: false, locators: {} };

	parser() {
		return this.props.parser;
	}

	componentDidUpdate(): void {
		// we have to careful for not looping it infinitely
		if (
			Object.keys(this.props.parser.locators).length > 0 &&
			Object.keys(this.state.locators).length === 0
		) {
			this.setState({ locators: { ...this.props.parser.locators } });
		}
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
				sx={{ width: 300, mb: "10px" }}
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
			/>
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
					{this.state.index === 0
						? this.askForLocators()
						: this.askForMethods()}
				</Paper>
			</Drawer>
		);
	}

	renderListItems() {
		const locators = this.state.locators;

		return (
			<List className={formStyles.listContainer}>
				{Object.keys(locators)
					.filter((locator) =>
						this.state.showPendingAlone ? !locators[locator] : true
					)
					.map((locator) => {
						return (
							<ListItem key={locator} disableGutters>
								<InputTextField
									label={locator}
									defaultValue={locators[locator]}
									required
									placeholder="Not yet decided"
									regexToMaintain={test_var_name}
									sx={{ width: "100%" }}
								/>
							</ListItem>
						);
					})}
			</List>
		);
	}

	renderInputs() {
		const locators = this.state.locators;
		const savedLength = Object.keys(locators).length;
		const fromInput = Object.keys(this.props.parser.locators).length;
		const hasLocators = savedLength > 0;

		return (
			<>
				{hasLocators ? (
					this.renderListItems()
				) : fromInput === savedLength ? (
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
				) : (
					<Skeleton
						width="100%"
						sx={{ flexGrow: 1 }}
						component={"article"}
					/>
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
					<Button
						variant="outlined"
						disabled={Object.values(locators).every(
							(locator) => locator
						)}
					>
						Generate
					</Button>
				</Stack>
			</>
		);
	}

	askForLocators() {
		return (
			<FormControl className={formStyles.formBox}>
				<>
					<Typography variant="subtitle1" sx={{ mb: "12px" }}>
						Please fill the names of the locators.
						<Divider variant="fullWidth" />
					</Typography>
					{this.renderOptions()}
					<FormControlLabel
						label="Filter Pending"
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
					{this.renderInputs()}
				</>
			</FormControl>
		);
	}

	verifySelection() {
		const locators = this.state.locators;
	}

	askForMethods() {
		return <></>;
	}
}

import TextField, { TextFieldProps } from "@mui/material/TextField";
import { ChangeEvent, Component, FocusEvent } from "react";
import { alpha, styled } from "@mui/material/styles";
import { OutlinedInputProps } from "@mui/material/OutlinedInput";

interface InputTextFieldProps {
	regexToMaintain?: RegExp;
	afterValidation?: (value: string, label: string, isValid: boolean) => void;
}

interface TextFieldState {
	error?: boolean;
}

export const CustomizedTextField = styled((props: TextFieldProps) => (
	<TextField
		InputProps={{ disableUnderline: true } as Partial<OutlinedInputProps>}
		{...props}
	/>
))(({ theme }) => ({
	"& .MuiFilledInput-root": {
		overflow: "hidden",
		borderRadius: 4,
		backgroundColor: "inherit",
		border: "1px solid",
		borderColor: theme.palette.mode === "light" ? "#E0E3E7" : "#2D3843",
		transition: theme.transitions.create([
			"border-color",
			"background-color",
			"box-shadow",
		]),
		"&:hover": {
			backgroundColor: "transparent",
		},
		"&.Mui-focused": {
			backgroundColor: "transparent",
			boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
			borderColor: theme.palette.primary.main,
		},
	},
}));

export default class InputTextField extends Component<
	InputTextFieldProps & TextFieldProps,
	TextFieldState
> {
	state: TextFieldState = {};

	validateInput(text: string): boolean {
		if (!this.props.regexToMaintain) return false;
		const isError = !this.props.regexToMaintain?.test(text);
		this.setState({ error: isError });
		return isError;
	}

	handleValidation(event: FocusEvent<HTMLInputElement>): void {
		const text = event.target.value;
		const isError = this.validateInput(text);
		if (this.props.afterValidation)
			this.props.afterValidation(text, String(this.props.label), isError);
	}

	notifyUser(event: ChangeEvent<HTMLInputElement>): void {
		const text = event.target.value;
		const isError = this.validateInput(text);
		if (this.props.afterValidation)
			this.props.afterValidation(text, String(this.props.label), true);
		// treated as error from the pending preceptive
	}

	render() {
		const refined_props = { ...this.props };

		delete refined_props.regexToMaintain;
		delete refined_props.afterValidation;

		return (
			<CustomizedTextField
				error={this.state.error || false}
				{...refined_props}
				onChange={
					this.props.regexToMaintain
						? this.notifyUser.bind(this)
						: undefined
				}
				onBlur={
					this.props.regexToMaintain
						? this.handleValidation.bind(this)
						: undefined
				}
				variant="filled"
				helperText={
					this.props.helperText ||
					(this.state.error && this.props.regexToMaintain
						? `Required: ${this.props.regexToMaintain}`
						: undefined)
				}
			/>
		);
	}
}

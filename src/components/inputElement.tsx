import TextField, { TextFieldProps } from "@mui/material/TextField";
import { ChangeEvent, Component } from "react";
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

	handleValidation(event: ChangeEvent<HTMLInputElement>): void {
		if (!this.props.regexToMaintain) return;
		const text = event.target.value;
		const isError = !this.props.regexToMaintain?.test(text);
		this.setState({ error: isError });
		if (this.props.afterValidation)
			this.props.afterValidation(text, String(this.props.label), isError);
	}

	render() {
		return (
			<CustomizedTextField
				error={this.state.error || false}
				{...this.props}
				onChange={
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

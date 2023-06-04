import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { ReactNode } from "react";
import Stack from "@mui/material/Stack";

interface WDialogProps extends DialogProps {
	titleChildren: ReactNode;
	onClose: () => void;
}

export default function WDialog(props: WDialogProps) {
	return (
		<Dialog
			onClose={props.onClose}
			open={props.open}
			PaperProps={{ sx: { backgroundColor: "ThreeDShadow" } }}
		>
			<DialogTitle>
				<Stack
					sx={{ display: "flex" }}
					justifyContent={"space-between"}
					alignItems="center"
					flexDirection={"row"}
				>
					{props.titleChildren}
					<IconButton onClick={props.onClose}>
						<CloseIcon />
					</IconButton>
				</Stack>
			</DialogTitle>
			{props.children}
		</Dialog>
	);
}

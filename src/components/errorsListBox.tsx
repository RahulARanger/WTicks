import { MouseEvent, useState } from "react";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { IconButton } from "@mui/material";

interface CounterProps {
	count?: number;
	isThereError?: boolean;
	onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function CounterIcon(props: CounterProps) {
	const content = !props.count ? 0 : props.count > 10 ? "10+" : props.count;
	return (
		<Badge
			badgeContent={content}
			color={
				props.isThereError
					? "error"
					: props.count && props.count > 0
					? "warning"
					: "primary"
			}
			overlap="circular"
		>
			<IconButton onClick={props.onClick} type="button">
				<NotificationsIcon color="secondary" />
			</IconButton>
		</Badge>
	);
}

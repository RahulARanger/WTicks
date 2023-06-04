import { useState } from "react";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { ToStandaloneScript } from "@/theory/parser";
import { ParsedTestStep } from "@/theory/sharedTypes";
import DialogContent from "@mui/material/DialogContent";
import WDialog from "../dialog";
import { WList } from "../list";
import WListItem from "../list";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

interface CounterProps {
	parser: ToStandaloneScript;
}

export function CounterIcon(props: CounterProps) {
	const [logs, setLogs] = useState<Array<ParsedTestStep>>([]);
	const [open, setOpen] = useState<boolean>(false);

	const parser = props.parser;

	parser.feedDispatcher((step?: ParsedTestStep) => {
		if (!step) return setLogs([]);

		logs.push(step);
		setLogs(logs);
	});

	const content = !logs.length
		? ""
		: logs.length < 10
		? `${logs.length}`
		: "10+";

	const toClose = () => setOpen(false);

	return (
		<>
			<Badge
				badgeContent={
					<Typography variant="subtitle2">{content}</Typography>
				}
				overlap="circular"
			>
				<IconButton color="warning" onClick={() => setOpen(true)}>
					<NotificationsIcon />
				</IconButton>
			</Badge>
			<WDialog open={open} onClose={toClose} titleChildren={"Alerts"}>
				<DialogContent>
					<WList length={logs.length} info="No Alerts received yet">
						<>
							{logs.map((_, index, ref_logs) => {
								const log =
									ref_logs[ref_logs.length - index - 1];
								return (
									<WListItem
										key={log.command_name + "-" + index}
									>
										<Alert
											title={"Failed to log"}
											severity="error"
										>
											<AlertTitle>
												{`${log.command_name} not recognized: ${log.logged}`}
											</AlertTitle>
											{`Following command: ${log.command_name} set on the locator ${log.target} is skipped`}
										</Alert>
									</WListItem>
								);
							})}
						</>
					</WList>
				</DialogContent>
			</WDialog>
		</>
	);
}

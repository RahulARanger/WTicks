import { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import { motion } from "framer-motion";

export default function InfoBox(props: { children: ReactNode }) {
	return (
		<Paper
			sx={{
				alignItems: "center",
				flexGrow: 1,
				width: "100%",
				justifyContent: "center",
				display: "flex",
			}}
		>
			<motion.div>{props.children}</motion.div>
		</Paper>
	);
}

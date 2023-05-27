"use client";

import { ReactNode } from "react";
import Box from "@mui/material/Box";

export default function CommonLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<title>WTicks</title>
			<Box
				sx={{ display: "flex", width: "100%", height: "100%" }}
				flexDirection="row"
			>
				{children}
			</Box>
		</>
	);
}

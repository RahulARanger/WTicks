"use client";

import { ReactNode, useState } from "react";
import Box from "@mui/material/Box";
import UploadFile from "@/components/UploadFile";

export default function CommonLayout({ children }: { children: ReactNode }) {
	const [fileSelected, setFileSelected] = useState();
	return (
		<>
			<title>WTicks</title>
			<Box
				sx={{ display: "flex", width: "100%", height: "100%" }}
				flexDirection="row"
				alignItems="center"
			>
				{children}
			</Box>
		</>
	);
}

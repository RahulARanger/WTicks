"use client";
import { Component, useState } from "react";
import { ToGherkinState } from "@/types/homePageTypes";
import UploadFile from "@/components/UploadFile";
import Box from "@mui/material/Box";

export default class HomePage extends Component<{}, ToGherkinState> {
	state: ToGherkinState = { fileUploadedRaw: "" };
	render() {
		return (
			<>
				<title>WTicks</title>
				<Box
					sx={{ display: "flex", width: "100%", height: "100%" }}
					flexDirection="row"
					alignItems="center"
				>
					<UploadFile />
				</Box>
			</>
		);
	}
}

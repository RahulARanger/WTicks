"use client";
import { Component, useState } from "react";
import { ToGherkinState } from "@/types/homePageTypes";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { motion } from "framer-motion";
import uploadFileStyles from "@/styles/uploadFile.module.sass";
import Link from "next/link";

export default class HomePage extends Component<{}, ToGherkinState> {
	state: ToGherkinState = { fileUploadedRaw: "" };
	links: { [key: string]: string } = {
		Standalone: "./converter/standalone",
	};

	onUpload(uploadString: string, selectedOption: string): void {
		return this.setState({ fileUploadedRaw: uploadString });
	}

	render() {
		return (
			<>
				<motion.div className={uploadFileStyles.uploadFileBox}>
					<Paper elevation={1} sx={{ p: "24px" }}>
						{Object.keys(this.links).map((key) => {
							return (
								<Link href={this.links[key]}>
									<Button color="primary" key={key}>
										<motion.span>{key}</motion.span>
									</Button>
								</Link>
							);
						})}
					</Paper>
				</motion.div>
			</>
		);
	}
}

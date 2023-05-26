"use client";

import { FileUploadProps, FileUploadState } from "@/types/fileUploadTypes";
import Paper from "@mui/material/Paper";
import { ChangeEvent, Component, ReactNode } from "react";
import React from "react";
import Button from "@mui/material/Button";
import UploadIcon from "@mui/icons-material/Upload";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import uploadFileStyles from "@/styles/uploadFile.module.sass";
import { motion } from "framer-motion";

export default class UploadFile extends Component<
	FileUploadProps,
	FileUploadState
> {
	uploadID = "file-upload";
	state: FileUploadState = { selectedFile: null };

	async handleFileSelected(onChange: ChangeEvent<HTMLInputElement>) {
		const fileUploaded = (onChange.target?.files || [])[0];
		if (!fileUploaded) return;
		this.setState({
			selectedFile: fileUploaded,
		});
	}

	renderInsides(): ReactNode {
		return (
			<>
				<input
					type="file"
					accept=".side"
					onChange={this.handleFileSelected.bind(this)}
					style={{ display: "none" }}
					id={this.uploadID}
				/>

				<Stack className={uploadFileStyles.uploadFileBox}>
					<motion.label
						htmlFor={this.uploadID}
						whileHover={{
							scale: 1.069,
							border: "4px dotted white",
						}}
						transition={{
							type: "spring",
							stiffness: 400,
							damping: 10,
						}}
					>
						<Paper
							elevation={1}
							className={uploadFileStyles.uploadFileInfoBox}
						>
							<Stack>
								<Button
									endIcon={<UploadIcon />}
									component="span"
								>
									Upload File
								</Button>
								<Typography variant="subtitle1">
									Drag and drop to upload .side file
								</Typography>
							</Stack>
						</Paper>
					</motion.label>
				</Stack>
			</>
		);
	}

	render(): ReactNode {
		return (
			<motion.div
				style={{
					width: "100%",
					height: "100%",
				}}
				exit={{
					x: -1e3,
				}}
				transition={{ type: "spring", stiffness: 400, damping: 10 }}
			>
				{this.renderInsides()}
			</motion.div>
		);
	}
}

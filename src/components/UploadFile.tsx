"use client";

import { FileUploadProps, FileUploadState } from "@/types/fileUploadTypes";
import Paper from "@mui/material/Paper";
import { ChangeEvent, Component, ReactNode } from "react";
import React from "react";
import Button from "@mui/material/Button";
import UploadIcon from "@mui/icons-material/Upload";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import uploadFileStyles from "@/styles/uploadFile.module.sass";
import { motion } from "framer-motion";
import { eye_raise, tilt_head } from "@/motion/whileHover";

export default class UploadFile extends Component<
	FileUploadProps,
	FileUploadState
> {
	uploadID = "file-upload";
	state: FileUploadState = { isLoading: false, fileSize: 0 };

	async handleFileSelected(onChange: ChangeEvent<HTMLInputElement>) {
		const fileUploaded = (onChange.target?.files || [])[0];
		if (!fileUploaded) return;

		const size = fileUploaded.size;
		this.setState({ isLoading: true, fileSize: size });

		return new Promise(async (resolve, reject) => {
			try {
				await this.props.dispatchDetails(await fileUploaded.text());
			} catch (err) {
				reject(String(err));
			}
			resolve(true);
		})
			.then(() => {
				this.setState({ isLoading: false, error: "" });
			})
			.catch((err: string) => {
				this.setState({ isLoading: false, error: err });
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
							...tilt_head,
							...eye_raise,
							border: "3px dotted white",
						}}
						transition={{
							type: "spring",
							stiffness: 400,
							damping: 10,
						}}
						layout
					>
						<Paper
							elevation={1}
							sx={{ p: 1 }}
							className={uploadFileStyles.uploadFileInfoBox}
						>
							<motion.div
								layout
								style={{
									display: "flex",
									flexFlow: "column wrap",
									justifyContent: "center",
								}}
							>
								{this.state.isLoading ? (
									<>
										<Skeleton
											width="100%"
											sx={{ height: "60px" }}
										/>
									</>
								) : (
									<>
										<Button
											endIcon={<UploadIcon />}
											component="span"
										>
											Upload File
										</Button>
									</>
								)}
								<Typography
									variant={"subtitle1"}
									sx={{ textAlign: "center" }}
								>
									{this.state.isLoading
										? `Validating the File Uploaded, size: ${
												this.state.fileSize / 1e3
										  } KB`
										: "Drag and drop to upload .side file"}
								</Typography>
								{this.state.error ? (
									<Alert
										severity="error"
										color="error"
										sx={{ mt: "10px" }}
									>
										{`Failed to parse the file: ${this.state.error}`}
									</Alert>
								) : (
									<></>
								)}
							</motion.div>
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

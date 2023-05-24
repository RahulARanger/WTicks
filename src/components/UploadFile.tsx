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

// class File{
// 	const [selectedFile, setSelectedFile] = useState(null);

// 	const handleFileSelect = (event) => {
// 		const file = event.target.files[0];
// 		setSelectedFile(file);
// 	};

// 	const handleUpload = () => {
// 		// Perform upload logic with the selected file
// 		if (selectedFile) {
// 			// Example: Send the file to a server
// 			const formData = new FormData();
// 			formData.append("file", selectedFile);
// 			// Send formData using Axios, Fetch API, or your preferred library
// 		}
// 	};

// 	return (
// 		<div>
// 			<input
// 				type="file"
// 				accept=".side"
// 				onChange={handleFileSelect}
// 				style={{ display: "none" }}
// 				id="file-upload"
// 			/>
// 			<label htmlFor="file-upload">
// 				<Button
// 					variant="contained"
// 					component="span"
// 					startIcon={<CloudUploadIcon />}
// 				>
// 					Upload File
// 				</Button>
// 			</label>
// 			<Button
// 				variant="contained"
// 				disabled={!selectedFile}
// 				onClick={handleUpload}
// 			>
// 				Upload
// 			</Button>
// 			{selectedFile && <div>Selected file: {selectedFile.name}</div>}
// 		</div>
// 	);
// };

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

				<Stack
					className={uploadFileStyles.uploadFileBox}
					alignItems={"center"}
					flexGrow={1}
					justifyContent={"center"}
				>
					<label htmlFor={this.uploadID}>
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
					</label>
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
					// display: this.state.selectedFile ? "unset" : "block",
				}}
				animate={{
					x: 10,
					transition: {
						duration: 0.4,
						ease: "easeOut",
						bounce: 3,
					},
				}}
				exit={{
					x: -1e3,
				}}
				// onAnimationEnd={(event) => {
				// 	event.currentTarget.style.display = "none";
				// }}
			>
				{this.renderInsides()}
			</motion.div>
		);
	}
}

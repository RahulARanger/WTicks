import { StandAloneScriptProps } from "./homePageTypes";

export interface FileUploadProps extends StandAloneScriptProps {}

export interface FileUploadState {
	fileSize: number;
	isLoading: boolean;
	error?: string;
}

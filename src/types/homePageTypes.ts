import { ToStandaloneScript } from "@/theory/parser";

export interface StandAloneScriptState {
	scriptParser?: ToStandaloneScript;
	scriptGenerated: string;
	fileName?: string;
}

export interface StandAloneScriptProps {
	dispatchDetails: (fileUploadedRaw: string, fileName: string) => void;
}

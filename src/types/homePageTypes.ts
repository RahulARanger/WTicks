import { ToStandaloneScript } from "@/theory/parser";

export interface StandAloneScriptState {
	scriptParser?: ToStandaloneScript;
	scriptGenerated: string;
}

export interface StandAloneScriptProps {
	dispatchDetails: (fileUploadedRaw: string) => void;
}

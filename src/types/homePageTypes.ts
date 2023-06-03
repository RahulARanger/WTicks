import { ToStandaloneScript } from "@/theory/parser";

export interface StandAloneScriptState {
	scriptParser?: ToStandaloneScript;
}

export interface StandAloneScriptProps {
	dispatchDetails: (fileUploadedRaw: string) => void;
}

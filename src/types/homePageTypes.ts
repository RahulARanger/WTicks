import { ToStandaloneScript } from "@/theory/parser";

export interface StandAloneScriptState {
	scriptParser?: ToStandaloneScript;
	needPatch?: boolean;
	patched?: boolean;
}

export interface StandAloneScriptProps {
	dispatchDetails: (fileUploadedRaw: string) => void;
}

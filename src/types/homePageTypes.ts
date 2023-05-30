import { ToStandaloneScript } from "@/theory/parser";

export interface StandAloneScriptState {
	scriptParser?: ToStandaloneScript;
	needPatch?: boolean;
	patched?: boolean;
	showDrawer: boolean;
}

export interface StandAloneScriptProps {
	dispatchDetails: (fileUploadedRaw: string) => void;
}

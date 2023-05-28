import { ToStandaloneScript } from "@/theory/parser";

export interface StandAloneScriptState {
	scriptParser?: ToStandaloneScript;
	needPatch?: boolean;
	patched?: boolean;
	viewerIndex: "0" | "1";
	showDrawer: boolean;
}

export interface StandAloneScriptProps {
	dispatchDetails: (fileUploadedRaw: string) => void;
}

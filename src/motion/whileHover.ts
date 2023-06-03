import { TargetAndTransition } from "framer-motion";
import springTransition from "./transitionTypes";

export const tilt_head: TargetAndTransition = {
	rotate: -4.69,
	transition: springTransition,
};

export const eye_raise: TargetAndTransition = {
	scale: 1.069,
};

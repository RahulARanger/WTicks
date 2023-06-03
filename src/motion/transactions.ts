import { MotionProps } from "framer-motion";
import springTransition from "./transitionTypes";

export const arise_from_bottom: MotionProps = {
	initial: { opacity: 0, y: 100 },
	animate: { opacity: 1, y: 0 },
	transition: { ...springTransition, duration: 0.6 },
};

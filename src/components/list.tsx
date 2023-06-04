import ListItem, { ListItemProps } from "@mui/material/ListItem";
import List, { ListProps } from "@mui/material/List";
import { motion, AnimatePresence, spring } from "framer-motion";
import springTransition from "@/motion/transitionTypes";
import { slide_to_left } from "@/motion/transactions";
import InfoBox from "./infoBox";
import { ReactNode } from "react";

export function WList(props: ListProps & { info: ReactNode; length: number }) {
	const pass_props = { ...props };
	pass_props.children = undefined;

	return (
		<AnimatePresence mode="popLayout">
			{props.length ? (
				<List {...pass_props}>{props.children}</List>
			) : (
				<InfoBox>{props.info}</InfoBox>
			)}
		</AnimatePresence>
	);
}

export default function WListItem(props: ListItemProps) {
	return (
		<motion.div
			layout
			key={props.key}
			{...slide_to_left}
			exit={{
				x: -30,
				opacity: 0,
				transition: { duration: 0.4, ...springTransition },
			}}
			transition={{ duration: 0.5 }}
			whileHover={{
				scale: 1.02,
				transition: {
					duration: 1.2,
					...springTransition,
				},
			}}
		>
			<ListItem disableGutters {...props} />
		</motion.div>
	);
}

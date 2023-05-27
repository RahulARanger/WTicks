import { Component } from "react";
import { motion } from "framer-motion";

const textVariants = {
	hidden: {
		opacity: 0,
		scale: 0.8,
	},
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			delayChildren: 0.3,
			staggerChildren: 1.2,
		},
	},
};

export default class WordByWord extends Component<
	{ sentence: string; className?: string },
	{}
> {
	render() {
		const words = this.props.sentence.split(" ") || [this.props.sentence];
		return (
			<motion.article layout className={this.props.className ?? ""}>
				{words.map((text, index) => (
					<motion.span
						key={index}
						variants={textVariants}
						initial="hidden"
						animate="visible"
					>
						{text}&nbsp;
					</motion.span>
				))}
			</motion.article>
		);
	}
}

"use client";
import { Component, ReactNode } from "react";
import UploadFile from "@/components/UploadFile";
export default class StandaloneScript extends Component {
	render(): ReactNode {
		return (
			<>
				<UploadFile />
			</>
		);
	}
}

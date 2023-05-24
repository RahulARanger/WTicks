"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const darkTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#e85403",
		},
		secondary: {
			main: "#0008bb",
		},
		error: {
			main: "#f71505",
		},
		warning: {
			main: "#ffb300",
		},
	},
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "WTicks",
	description: "Helper for using WebdriverIO",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ThemeProvider theme={darkTheme}>
					<CssBaseline />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}

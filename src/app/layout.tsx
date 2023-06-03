"use client";

import "../styles/globals.sass";
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
			main: "#ff6d00",
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

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<title>WTicks</title>
			</head>
			<body className={inter.className}>
				<ThemeProvider theme={darkTheme}>
					<CssBaseline />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}

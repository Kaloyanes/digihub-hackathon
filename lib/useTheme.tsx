import { createContext, useContext } from "react";

interface ThemeColors {
	primary: string;
	secondary: string;
	background: string;
	text: string;
}

interface ThemeSpacing {
	small: string;
	medium: string;
	large: string;
}

interface Theme {
	colors: ThemeColors;
	spacing: ThemeSpacing;
}

const defaultTheme: Theme = {
	colors: {
		primary: "#007AFF",
		secondary: "#5856D6",
		background: "#FFFFFF",
		text: "#000000",
	},
	spacing: {
		small: "8px",
		medium: "16px",
		large: "24px",
	},
};

const ThemeContext = createContext<Theme>(defaultTheme);

export const useTheme = () => {
	const theme = useContext(ThemeContext);
	if (!theme) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return theme;
};

export const ThemeProvider = ThemeContext.Provider;
export type { Theme, ThemeColors, ThemeSpacing };

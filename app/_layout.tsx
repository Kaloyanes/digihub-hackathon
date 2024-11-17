import "~/global.css";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Theme, ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { SplashScreen, Stack } from "expo-router";
import * as React from "react";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import ProfileUser from "~/components/ProfileUser";
import { ThemeToggle } from "~/components/ThemeToggle";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";

const LIGHT_THEME: Theme = {
	dark: false,
	colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
	dark: true,
	colors: NAV_THEME.dark,
};

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
	const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

	useEffect(() => {
		(async () => {
			const theme = await AsyncStorage.getItem("theme");
			if (Platform.OS === "web") {
				// Adds the background color to the html element to prevent white background on overscroll.
				document.documentElement.classList.add("bg-background");
			}
			if (!theme) {
				AsyncStorage.setItem("theme", colorScheme);
				setIsColorSchemeLoaded(true);
				return;
			}
			const colorTheme = theme === "dark" ? "dark" : "light";
			if (colorTheme !== colorScheme) {
				setColorScheme(colorTheme);
				setIsColorSchemeLoaded(true);
				return;
			}
			setIsColorSchemeLoaded(true);
		})().finally(() => {
			SplashScreen.hideAsync();
		});
	}, [colorScheme, setColorScheme]);

	if (!isColorSchemeLoaded) {
		return null;
	}

	return (
		<KeyboardProvider>
			<ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
				<View className="bg-background" style={{ flex: 1 }}>
					<Stack
						screenOptions={{
							headerShadowVisible: false,
						}}
					>
						<Stack.Screen
							name="index"
							options={{
								title: "",
								headerRight: () => (
									<View className="flex justify-end flex-row gap-4">
										<ThemeToggle />
										<ProfileUser />
									</View>
								),
							}}
						/>
						<Stack.Screen
							name="login"
							options={{
								title: "",
							}}
						/>
						<Stack.Screen
							name="register"
							options={{
								title: "",
							}}
						/>
						<Stack.Screen
							name="play"
							options={{
								title: "Play",
							}}
						/>
						<Stack.Screen
							name="play/select-difficulty"
							options={{
								title: "Select Difficulty",
							}}
						/>
					</Stack>
					<PortalHost />
				</View>
			</ThemeProvider>
		</KeyboardProvider>
	);
}

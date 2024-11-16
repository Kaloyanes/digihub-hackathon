import { useRouter } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import { trigger } from "react-native-haptic-feedback";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { HapticFeedbackOptions } from "~/lib/constants";

export default function HomeScreen() {
	const router = useRouter();
	return (
		<View className="flex-1 justify-center items-center gap-5 p-6">
			<Animated.View entering={FadeInUp} className="w-full">
				<Text className="text-center w-full">This is a test</Text>
				<Button
					onPress={() => {
						router.push("/login");
						trigger("keyboardTap", HapticFeedbackOptions);
					}}
				>
					<Text>Press Me</Text>
				</Button>
			</Animated.View>
		</View>
	);
}

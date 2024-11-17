import { useRouter } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import { trigger } from "react-native-haptic-feedback";
import Animated from "react-native-reanimated";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { HapticFeedbackOptions } from "~/lib/constants";

const AnimatedButton = Animated.createAnimatedComponent(Button);

function HomeScreen() {
	const router = useRouter();
	return (
		<View className="flex-1  justify-center items-center gap-5 p-6">
			<AnimatedButton
				variant={"outline"}
				className={"w-1/2"}
				onPress={() => {
					router.push("/login");
					trigger("keyboardTap", HapticFeedbackOptions);
				}}
			>
				<Text className="font-[Manrope] font-bold">Learn</Text>
			</AnimatedButton>
			<AnimatedButton
				variant={"outline"}
				className={"w-1/2"}
				onPress={() => {
					router.push("/play/select-difficulty");
					trigger("keyboardTap", HapticFeedbackOptions);
				}}
			>
				<Text className="font-[Manrope] font-bold">Play</Text>
			</AnimatedButton>
		</View>
	);
}

export default HomeScreen;

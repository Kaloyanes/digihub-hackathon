import React from "react";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

export default function LoginPage() {
	const { progress, height } = useReanimatedKeyboardAnimation();

	const animatedStyles = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: height.value,
				},
			],
		};
	});

	return (
		<Animated.View style={animatedStyles} className="">
			<Text>Login</Text>
			<Input placeholder="Username" />
		</Animated.View>
	);
}

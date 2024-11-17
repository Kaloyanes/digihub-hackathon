import React from "react";
import { Pressable } from "react-native";
import Animated, {
	useAnimatedStyle,
	withSpring,
} from "react-native-reanimated";
import { Text } from "./ui/text";

interface FlashCardProps {
	question: string;
	onSubmit: (answer: string) => void;
	isFlipped: boolean;
	onFlip: () => void;
}

export function FlashCard({
	question,
	onSubmit,
	isFlipped,
	onFlip,
}: FlashCardProps) {
	const flipAnimation = useAnimatedStyle(() => ({
		transform: [{ rotateY: withSpring(isFlipped ? "180deg" : "0deg") }],
	}));

	return (
		<Pressable onPress={onFlip} className="w-full max-w-[300px] h-[200px]">
			<Animated.View
				style={[flipAnimation]}
				className="w-full h-full bg-card rounded-xl p-4 justify-center items-center"
			>
				<Text className="text-lg text-center text-foreground">
					{isFlipped ? "Tap to show question" : question}
				</Text>
			</Animated.View>
		</Pressable>
	);
}

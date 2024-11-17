import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	withSpring,
} from "react-native-reanimated";
import { Text } from "./ui/text";

interface FlashCardProps {
	question: string;
	answer: string;
	isFlipped: boolean;
	onFlip: () => void;
	isLesson?: boolean;
	difficulty?: string;
}

export function FlashCard({
	question,
	answer,
	isFlipped,
	onFlip,
	isLesson = false,
	difficulty,
}: FlashCardProps) {
	const frontAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ perspective: 1000 },
			{ rotateY: withSpring(isFlipped ? "180deg" : "0deg") },
		],
		backfaceVisibility: "hidden",
		zIndex: isFlipped ? 0 : 1,
		position: "absolute",
		width: "100%",
		height: "100%",
	}));

	const backAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ perspective: 1000 },
			{ rotateY: withSpring(isFlipped ? "0deg" : "-180deg") },
		],
		backfaceVisibility: "hidden",
		zIndex: isFlipped ? 1 : 0,
		position: "absolute",
		width: "100%",
		height: "100%",
	}));

	return (
		<Pressable
			onPress={isLesson ? onFlip : null}
			className="w-full max-w-[300px] h-[200px] relative"
		>
			{difficulty && (
				<View className="absolute top-2 right-2 z-10">
					<Text className="text-xs w-full text-center text-secondary-foreground px-2 py-1 bg-secondary rounded-full">
						{difficulty}
					</Text>
				</View>
			)}
			<Animated.View
				style={frontAnimatedStyle}
				className="bg-primary rounded-xl p-4 justify-center items-center"
			>
				<Text className="text-lg text-center text-primary-foreground w-full">
					{question}
				</Text>
			</Animated.View>
			<Animated.View
				style={backAnimatedStyle}
				className="bg-primary rounded-xl p-4 justify-center items-center"
			>
				<Text className="text-lg text-center text-primary-foreground w-full">
					{answer}
				</Text>
			</Animated.View>
		</Pressable>
	);
}

import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

export default function SelectDifficultyScreen() {
	const difficulties = ["Fundamentals", "Basic", "Advanced"];

	const handleSelectDifficulty = (difficulty: string) => {
		router.push({
			pathname: "/play",
			params: { difficulty },
		});
	};

	return (
		<View className="flex-1 items-center justify-center p-4">
			<Text className="text-2xl font-bold mb-8">Choose Difficulty</Text>
			<View className="flex-col gap-4">
				{difficulties.map((diff) => (
					<Button
						key={diff}
						onPress={() => handleSelectDifficulty(diff)}
						variant="default"
					>
						<Text>{diff}</Text>
					</Button>
				))}
			</View>
		</View>
	);
}

import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { FlashCard } from "../../components/FlashCard";
import { Text } from "../../components/ui/text";
import type { Lesson } from "../../lib/db/lessons";

export default function LessonPage() {
	const { data } = useLocalSearchParams<{ data: string }>();
	if (!data) {
		return (
			<View className="flex-1 justify-center items-center">
				<Text>No lesson data found</Text>
			</View>
		);
	}

	useEffect(() => {
		console.log(data);
	}, [data]);

	try {
		const decodedData = decodeURIComponent(data);
		const lesson: Lesson = JSON.parse(decodedData);
		const [isFlipped, setIsFlipped] = useState(false);

		return (
			<View className="flex-1 justify-center items-center px-4 pt-4">
				<FlashCard
					question={lesson.question}
					answer={lesson.explanation}
					isFlipped={isFlipped}
					onFlip={() => setIsFlipped(!isFlipped)}
					isLesson={false}
					difficulty={lesson.difficulty}
				/>
				<ScrollView>
					<Text className="mx-4 mt-4 text-lg">{lesson.explanation}</Text>
				</ScrollView>
			</View>
		);
	} catch (error) {
		return (
			<View className="flex-1 justify-center items-center">
				<Text>Invalid lesson data</Text>
			</View>
		);
	}
}

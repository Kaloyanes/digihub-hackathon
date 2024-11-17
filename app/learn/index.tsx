import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { FlashCard } from "../../components/FlashCard";
import { Text } from "../../components/ui/text";
import { type Lesson, getLessonsByDifficulty } from "../../lib/db/lessons";

export default function LearnPage() {
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLessons = async () => {
			try {
				setIsLoading(true);
				const fetchedLessons = await getLessonsByDifficulty();
				setLessons(fetchedLessons);
			} catch (err) {
				setError("Failed to load lessons");
			} finally {
				setIsLoading(false);
			}
		};
		fetchLessons();
	}, []);

	useEffect(() => {
		console.log(lessons);
	}, [lessons]);

	if (isLoading) {
		return (
			<View className="flex-1 w-full justify-center items-center">
				<Text className="w-full text-center">Loading lessons...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View className="flex-1 w-full justify-center items-center">
				<Text className="w-full text-center">{error}</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 pt-4">
			{lessons.length === 0 ? (
				<Text className="text-center">No lessons available</Text>
			) : (
				<FlatList
					data={lessons}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({ item }) => (
						<View className="mb-4 w-full justify-center items-center">
							<FlashCard
								question={item.question}
								answer={item.explanation}
								isFlipped={false}
								onFlip={() =>
									router.push(
										`/learn/lesson?data=${encodeURIComponent(
											JSON.stringify(item),
										)}`,
									)
								}
								isLesson={true}
								difficulty={item.difficulty}
							/>
						</View>
					)}
				/>
			)}
		</View>
	);
}

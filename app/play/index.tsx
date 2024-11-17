import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { FlashCard } from "~/components/FlashCard";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { checkAnswer, getQuestionsByDifficulty } from "~/lib/db/questions";

function PlayPage() {
	const { difficulty: initialDifficulty } = useLocalSearchParams<{
		difficulty: string;
	}>();
	const [difficulty, setDifficulty] = useState(initialDifficulty || "");
	const [questions, setQuestions] = useState<any[]>([]);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [showConfetti, setShowConfetti] = useState(false);
	const [timer, setTimer] = useState(60);
	const [gameStarted, setGameStarted] = useState(false);
	const [isGameOver, setIsGameOver] = useState(false);
	const [isFlipped, setIsFlipped] = useState(false);
	const [userAnswer, setUserAnswer] = useState("");

	useEffect(() => {
		if (initialDifficulty) {
			startGame(initialDifficulty);
		}
	}, [initialDifficulty]);

	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (gameStarted && timer > 0 && !isGameOver) {
			interval = setInterval(() => {
				setTimer((prev) => {
					if (prev <= 1) {
						setIsGameOver(true);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [gameStarted, timer, isGameOver]);

	const startGame = async (diff: string) => {
		setDifficulty(diff);
		setTimer(60);
		setIsGameOver(false);
		const fetchedQuestions = await getQuestionsByDifficulty(diff, 5);
		setQuestions(Array.from(fetchedQuestions));
		setGameStarted(true);
	};

	const scale = useSharedValue(1);
	const backgroundColor = useSharedValue("rgb(214, 219, 220)");

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		backgroundColor: backgroundColor.value,
	}));

	const updateQuestion = () => {
		if (currentQuestion < questions.length - 1) {
			setCurrentQuestion((prev) => prev + 1);
		}
	};

	const checkAnswerAsync = async (
		questionId: string,
		answer: string,
		timeLeft: number,
	) => {
		const isCorrect = await checkAnswer(questionId, answer, timeLeft);
		backgroundColor.value = withSequence(
			withTiming(isCorrect ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)", {
				duration: 150,
			}),
			withTiming("rgb(214, 219, 220)", { duration: 150 }),
		);

		if (isCorrect) {
			runOnJS(updateQuestion)();
			return;
		}

		runOnJS(setIsGameOver)(true);
	};

	const checkBasicAnswer = async (answer: string) => {
		const questionId = questions[currentQuestion].id;
		const isCorrect = await checkAnswer(questionId, answer, timer);

		backgroundColor.value = withSequence(
			withTiming(isCorrect ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)", {
				duration: 150,
			}),
			withTiming("rgb(214, 219, 220)", { duration: 150 }),
		);

		if (isCorrect) {
			setIsFlipped(false);
			setUserAnswer("");
			runOnJS(updateQuestion)();
			return;
		}

		runOnJS(setIsGameOver)(true);
	};

	const handleAnswer = (answer: string) => {
		const questionId = questions[currentQuestion].id;

		// Immediate visual feedback
		scale.value = withSequence(
			withTiming(1.05, { duration: 150, easing: Easing.inOut(Easing.poly(5)) }),
			withTiming(1, { duration: 150, easing: Easing.inOut(Easing.poly(5)) }),
		);

		// Check answer asynchronously
		checkAnswerAsync(questionId, answer, timer);
	};

	if (isGameOver) {
		return (
			<View className="flex-1 items-center justify-center p-4 bg-background">
				<Text className="text-2xl font-bold mb-8 text-foreground">
					Game Over!
				</Text>
				<Button
					onPress={() => {
						router.back();
					}}
					variant="default"
				>
					<Text>Play again</Text>
				</Button>
			</View>
		);
	}

	return (
		<View className="flex-1 items-center justify-center p-4 bg-background">
			<Text className="text-xl mb-4 text-foreground px-10 text-center absolute top-4 left-4">
				Time: {timer}s
			</Text>

			{questions.length > 0 &&
				(difficulty === "advanced" ? (
					<View className="w-full items-center space-y-4">
						<FlashCard
							question={questions[currentQuestion].data().question}
							onSubmit={checkBasicAnswer}
							isFlipped={isFlipped}
							onFlip={() => setIsFlipped(!isFlipped)}
						/>
						<TextInput
							className="w-full max-w-[300px] h-12 px-4 bg-card rounded-lg text-foreground"
							value={userAnswer}
							onChangeText={setUserAnswer}
							placeholder="Type your answer..."
							placeholderTextColor="#666"
						/>
						<Button onPress={() => checkBasicAnswer(userAnswer)}>
							<Text>Submit Answer</Text>
						</Button>
					</View>
				) : (
					<>
						<Text className="text-lg mb-8 text-center text-foreground w-full">
							{questions[currentQuestion].data().question}
						</Text>
						<View className="w-full flex-row flex-wrap justify-center gap-4">
							{questions[currentQuestion]
								.data()
								.possibleAnswers.map((answer: string) => (
									<Animated.View
										key={answer}
										style={[animatedStyle]}
										className="w-[40%] h-20 rounded-lg justify-center items-center"
									>
										<Pressable
											onPress={() => handleAnswer(answer)}
											className="flex-1 justify-center w-full rounded-lg"
										>
											<Text className="text-base text-center font-medium text-primary-foreground">
												{answer}
											</Text>
										</Pressable>
									</Animated.View>
								))}
						</View>
					</>
				))}
		</View>
	);
}

export default PlayPage;

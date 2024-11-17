import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, {
	Easing,
	interpolate,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { FlashCard } from "~/components/FlashCard";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
	const [timer, setTimer] = useState(
		initialDifficulty === "Advanced" ? 120 : 60,
	);
	const [gameStarted, setGameStarted] = useState(false);
	const [isGameOver, setIsGameOver] = useState(false);
	const [isFlipped, setIsFlipped] = useState(false);
	const [userAnswer, setUserAnswer] = useState("");
	const { progress, height } = useReanimatedKeyboardAnimation();
	const [correctAnswers, setCorrectAnswers] = useState(0);
	const [incorrectAnswers, setIncorrectAnswers] = useState(0);

	useEffect(() => {
		if (questions.length > 0) {
			console.log(
				"Current question answer:",
				questions[currentQuestion].data().answer,
			);
		}
	}, [currentQuestion, questions]);

	const animatedKeyboardStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateY: interpolate(
					progress.value,
					[0, 1],
					[0, height.value * 0.5],
				),
			},
		],
	}));

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
		console.log("Starting game with difficulty:", diff); // Add debug log
		setDifficulty(diff);
		setTimer(60);
		setIsGameOver(false);
		const fetchedQuestions = await getQuestionsByDifficulty(
			diff,
			difficulty === "Advanced" ? 2 : 5,
		);
		console.log("Fetched questions:", fetchedQuestions); // Add debug log
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
			runOnJS(setCorrectAnswers)((prev: number) => prev + 1);
			runOnJS(updateQuestion)();
		} else {
			runOnJS(setIncorrectAnswers)((prev: number) => prev + 1);
		}

		if (
			currentQuestion === questions.length - 1 ||
			(difficulty === "Advanced" && !isCorrect)
		) {
			runOnJS(setIsGameOver)(true);
		}
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
			setCorrectAnswers((prev) => prev + 1);
			setIsFlipped(false);
			setUserAnswer("");
			if (currentQuestion === questions.length - 1) {
				setIsGameOver(true);
				return;
			}
			runOnJS(updateQuestion)();
			return;
		}

		setIncorrectAnswers((prev) => prev + 1);
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
				<Text className="text-lg mb-4 text-foreground w-full text-center">
					Correct Answers: {correctAnswers}
				</Text>
				<Text className="text-lg mb-8 text-foreground w-full text-center">
					Incorrect Answers: {incorrectAnswers}
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
	const AnimatedButton = Animated.createAnimatedComponent(Button);
	return (
		<View className="flex-1 items-center justify-center p-4 bg-background">
			<Text className="text-xl mb-4 text-foreground px-10  absolute top-4 w-full text-right">
				Time: {timer}s
			</Text>

			<Animated.View
				className="flex-1 w-full items-center justify-center"
				style={animatedKeyboardStyle}
			>
				{questions.length > 0 &&
					(difficulty.toLowerCase() === "advanced" ? (
						<View className="w-full items-center justify-center gap-4 px-4">
							<FlashCard
								question={questions[currentQuestion].data().question}
								answer={questions[currentQuestion].data().answer}
								isFlipped={isFlipped}
								onFlip={() => setIsFlipped(!isFlipped)}
							/>
							<Input
								className="w-full max-w-[300px] h-12 px-4 bg-card rounded-lg text-foreground"
								value={userAnswer}
								onChangeText={setUserAnswer}
								placeholder="Type your answer..."
								placeholderTextColor="#666"
							/>
							{userAnswer.trim().length > 0 && (
								<AnimatedButton onPress={() => checkBasicAnswer(userAnswer)}>
									<Text>Check Answer</Text>
								</AnimatedButton>
							)}
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
			</Animated.View>
		</View>
	);
}

export default PlayPage;

import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, {
	interpolate,
	useAnimatedStyle,
} from "react-native-reanimated";
import Logo from "~/components/Logo";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { loginUser } from "~/lib/db/users";

function LoginScreen() {
	const router = useRouter();
	const [form, setForm] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { progress, height } = useReanimatedKeyboardAnimation();

	const handleLogin = async () => {
		if (!form.email || !form.password) {
			setError("Please fill in all fields");
			return;
		}

		setLoading(true);
		try {
			await loginUser(form.email, form.password);
			router.dismissAll();
		} catch (error: any) {
			setError(error.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	const animatedStyles = useAnimatedStyle(() => ({
		transform: [
			{
				translateY: interpolate(
					progress.value,
					[0, 1],
					[0, height.value * 0.4],
				),
			},
		],
	}));

	return (
		<View className="flex-1">
			<View className="flex flex-row absolute top-4 items-center w-full">
				<Text className="w-full text-4xl text-center font-[Manrope] font-semibold">
					Goose Soft
				</Text>
				<Logo />
			</View>
			<Animated.View
				style={animatedStyles}
				className="items-center justify-center px-5 flex-1 gap-3"
			>
				<Input
					placeholder="Email"
					className="w-full"
					onChangeText={(value) =>
						setForm((prev) => ({ ...prev, email: value }))
					}
					autoCapitalize="none"
				/>

				<Input
					placeholder="Password"
					className="w-full"
					secureTextEntry
					onChangeText={(value) =>
						setForm((prev) => ({ ...prev, password: value }))
					}
				/>

				{error ? <Text className="text-red-500 text-sm">{error}</Text> : null}

				<Button
					className="w-full font-[Manrope] font-bold"
					onPress={handleLogin}
					disabled={loading}
				>
					<Text>{loading ? "Logging in..." : "Login"}</Text>
				</Button>

				<Button
					variant="link"
					onPress={() => router.push("/register")}
					className="w-full"
				>
					<Text>Don't have an account? Register</Text>
				</Button>
			</Animated.View>
		</View>
	);
}

export default LoginScreen;

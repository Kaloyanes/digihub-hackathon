import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, {
	interpolate,
	useAnimatedStyle,
} from "react-native-reanimated";
import Logo from "~/components/Logo";
import { createUser, loginUser } from "~/lib/db/users";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

function RegisterScreen() {
	const router = useRouter();
	const [form, setForm] = useState({
		email: "",
		username: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState({
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);

	const { progress, height } = useReanimatedKeyboardAnimation();

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleInputChange = (field: string, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));

		if (field === "email") {
			setErrors((prev) => ({
				...prev,
				email: validateEmail(value) ? "" : "Invalid email format",
			}));
		}

		if (field === "password" || field === "confirmPassword") {
			setErrors((prev) => ({
				...prev,
				password:
					form.password.length < 6
						? "Password must be at least 6 characters"
						: "",
				confirmPassword:
					form.password !== value ? "Passwords do not match" : "",
			}));
		}
	};

	const handleRegister = async () => {
		if (
			!form.email ||
			!form.password ||
			!form.username ||
			!form.confirmPassword
		) {
			setErrors((prev) => ({
				...prev,
				email: "All fields are required",
			}));
			return;
		}

		if (Object.values(errors).some((error) => error !== "")) {
			return;
		}

		setLoading(true);
		try {
			await createUser(form.username, form.email, form.password);
			await loginUser(form.email, form.password);
			router.dismissAll();
		} catch (error: any) {
			setErrors((prev) => ({
				...prev,
				email: error.message || "Registration failed",
			}));
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
					onChangeText={(value) => handleInputChange("email", value)}
				/>
				{errors.email ? (
					<Text className="text-red-500 text-sm">{errors.email}</Text>
				) : null}

				<Input
					placeholder="Username"
					className="w-full"
					onChangeText={(value) => handleInputChange("username", value)}
				/>

				<Input
					placeholder="Password"
					className="w-full"
					secureTextEntry
					onChangeText={(value) => handleInputChange("password", value)}
				/>
				{errors.password ? (
					<Text className="text-red-500 text-sm">{errors.password}</Text>
				) : null}

				<Input
					placeholder="Confirm Password"
					className="w-full"
					secureTextEntry
					onChangeText={(value) => handleInputChange("confirmPassword", value)}
				/>
				{errors.confirmPassword ? (
					<Text className="text-red-500 text-sm">{errors.confirmPassword}</Text>
				) : null}

				<Button
					className="w-full font-[Manrope] font-bold"
					onPress={handleRegister}
					disabled={loading}
				>
					<Text>{loading ? "Registering..." : "Register"}</Text>
				</Button>

				<Button
					variant="link"
					onPress={() => router.push("/login")}
					className="w-full"
				>
					<Text>Already have an account? Login</Text>
				</Button>
			</Animated.View>
		</View>
	);
}

export default RegisterScreen;

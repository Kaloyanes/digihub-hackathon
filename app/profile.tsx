import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Easing } from "react-native-reanimated";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useTheme } from "~/lib/useTheme";
import type { User } from "../lib/db/users";
import {
	getCurrentUser,
	sendPasswordReset,
	updateUserProfile,
	uploadProfilePicture,
} from "../lib/db/users";

function ProfileScreen() {
	const { colors } = useTheme();
	const [user, setUser] = useState<User | null>(null);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");

	useEffect(() => {
		loadUser();
	}, []);

	const loadUser = async () => {
		const currentUser = await getCurrentUser();
		setUser(currentUser);
		if (currentUser) {
			setUsername(currentUser.username);
			setEmail(currentUser.email);
		}
	};

	const handleUpdateProfile = async () => {
		try {
			await updateUserProfile({ username, email });
			Alert.alert("Success", "Profile updated successfully");
			loadUser();
		} catch (error) {
			Alert.alert("Error", "Failed to update profile");
		}
	};

	const handlePasswordReset = async () => {
		try {
			await sendPasswordReset(email);
			Alert.alert("Success", "Password reset email sent");
		} catch (error) {
			Alert.alert("Error", "Failed to send password reset email");
		}
	};

	const handleImagePick = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled && result.assets[0].uri) {
			try {
				await uploadProfilePicture(result.assets[0].uri);
				await loadUser();
			} catch (error) {
				Alert.alert("Error", "Failed to upload image");
				console.log(error);
			}
		}
	};

	if (!user)
		return (
			<View className="flex-1 items-center justify-center">
				<Text className="text-foreground text-lg">Loading...</Text>
			</View>
		);

	return (
		<View className="flex-1 p-5 items-center bg-background">
			<View className="relative mb-5">
				<AnimatedCircularProgress
					size={120}
					width={5}
					fill={50}
					delay={300}
					easing={Easing.inOut(Easing.poly(5))}
					onAnimationComplete={() => console.log("onAnimationComplete")}
					tintColor={colors.primary}
					backgroundColor={colors.background}
					rotation={0}
					lineCap="round"
				>
					{(fill) => (
						<Avatar alt="HKDOSA" className="w-full h-full">
							<TouchableOpacity onPress={handleImagePick}>
								<AvatarImage
									source={{ uri: user.avatar || "https://placeholder.com/150" }}
								/>
								<AvatarFallback>
									<Text className="text-primary">+</Text>
								</AvatarFallback>
							</TouchableOpacity>
						</Avatar>
					)}
				</AnimatedCircularProgress>
			</View>

			<Input
				className="mb-3 w-full"
				value={username}
				onChangeText={setUsername}
				placeholder="Username"
			/>

			<Input
				className="mb-3 w-full"
				value={email}
				onChangeText={setEmail}
				placeholder="Email"
				keyboardType="email-address"
				autoCapitalize="none"
			/>

			<View className="w-full flex flex-col gap-3">
				<Button onPress={handleUpdateProfile} className="w-full">
					<Text className="w-full text-center">Update Profile</Text>
				</Button>

				<Button
					onPress={handlePasswordReset}
					variant="outline"
					className="w-full"
				>
					<Text className="w-full text-center text-foreground">
						Reset Password
					</Text>
				</Button>
			</View>
		</View>
	);
}

export default ProfileScreen;

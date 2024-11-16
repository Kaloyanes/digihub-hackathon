import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { type User, getCurrentUser } from "~/lib/db/users";
import { Loader2 } from "~/lib/icons/Loader2";
import { UserIcon } from "~/lib/icons/User";
import { cn } from "~/lib/utils";

export default function ProfileUser() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const avatar = false;

	useEffect(() => {
		getCurrentUser().then((user) => {
			setUser(user);
			setLoading(false);
		});
	}, []);

	const router = useRouter();

	if (loading)
		return (
			<View className="animate-spin items-center justify-center ">
				<Loader2 className="text-foreground" size={24} strokeWidth={1.25} />
			</View>
		);

	return (
		<Pressable
			onPress={() => {
				if (user) {
					router.push("/profile");
				} else {
					router.push("/login");
				}
			}}
			className="web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2"
		>
			{({ pressed }) => (
				<View
					className={cn(
						"flex-1 aspect-square pt-0.5 justify-center items-center web:px-5",
						pressed && "opacity-70",
					)}
				>
					{user ? (
						<UserIcon
							className="text-foreground"
							size={23}
							strokeWidth={1.25}
						/>
					) : (
						<UserIcon
							className="text-foreground"
							size={24}
							strokeWidth={1.25}
						/>
					)}
				</View>
			)}
		</Pressable>
	);
}

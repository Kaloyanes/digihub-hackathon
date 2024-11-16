import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword, // Add this import
  updateEmail,
} from "firebase/auth";
import {
  type DocumentData,
  type FirestoreDataConverter,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../firebase";

type User = {
  uid: string;
  username: string;
  email: string;
  avatar: string | undefined;
  level: number;
  xp: number;
  selectedDifficulty: string;
  questionsAnswered: number;
};

const userConverter: FirestoreDataConverter<User> = {
  toFirestore: (user: User): DocumentData => {
    return {
      uid: user.uid,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
      selectedDifficulty: user.selectedDifficulty,
      questionsAnswered: user.questionsAnswered,
    };
  },
  fromFirestore: (snapshot: any, options: any): User => {
    const data = snapshot.data(options);
    return {
      uid: data.uid,
      username: data.username,
      email: data.email,
      avatar: data.avatar,
      level: data.level,
      xp: data.xp,
      selectedDifficulty: data.selectedDifficulty,
      questionsAnswered: data.questionsAnswered,
    };
  },
};

async function createUser(
  username: string,
  email: string,
  password: string,
): Promise<User> {
  const newUser: User = {
    uid: "",
    username,
    email,
    avatar: "",
    level: 0,
    xp: 0,
    selectedDifficulty: "Fundamentals",
    questionsAnswered: 0,
  };

  const credentials = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const uid = credentials.user.uid;
  newUser.uid = uid;

  await setDoc(doc(db, "users", uid).withConverter(userConverter), newUser);

  return newUser;
}

async function getUser(uid: string): Promise<User | null> {
  const docRef = doc(db, "users", uid).withConverter(userConverter);
  const docSnapshot = await getDoc(docRef);

  if (docSnapshot.exists()) {
    return docSnapshot.data();
  }

  return null;
}

async function getCurrentUser(): Promise<User | null> {
  if (!auth.currentUser) return null;

  const uid = auth.currentUser.uid;
  const user = await getUser(uid);

  return user;
}

async function updateCurrentUser(data: Partial<User>) {
  if (!auth.currentUser) return;

  const uid = auth.currentUser.uid;

  await updateDoc(doc(db, "users", uid).withConverter(userConverter), data);
}

async function updateUserProfile(data: { username?: string; email?: string }) {
  if (!auth.currentUser) return;

  if (data.email) {
    await updateEmail(auth.currentUser, data.email);
  }

  await updateCurrentUser(data);
}

async function uploadProfilePicture(uri: string): Promise<string> {
  if (!auth.currentUser) throw new Error("No user logged in");

  const response = await fetch(uri);
  const blob = await response.blob();

  const fileRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);

  await uploadBytes(fileRef, blob);
  const downloadURL = await getDownloadURL(fileRef);

  await updateCurrentUser({ avatar: downloadURL });
  return downloadURL;
}

async function sendPasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email);
}

async function loginUser(
  email: string,
  password: string,
): Promise<User | null> {
  const credentials = await signInWithEmailAndPassword(auth, email, password);
  const uid = credentials.user.uid;
  return await getUser(uid);
}

export {
  createUser,
  getCurrentUser,
  loginUser, // Add this export
  sendPasswordReset,
  updateCurrentUser,
  updateUserProfile,
  uploadProfilePicture,
  type User,
};

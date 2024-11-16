import { db, auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, DocumentData, FirestoreDataConverter, setDoc, getDoc, updateDoc } from "firebase/firestore";

type User = {
    uid: string,
    username: string
    email: string
    avatar: string | undefined
    level: number
    xp: number
    selectedDifficulty: string
    questionsAnswered: number
}

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
            questionsAnswered: user.questionsAnswered
        }
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
            questionsAnswered: data.questionsAnswered
        }
    }
}

async function createUser(username: string, email: string, password: string): Promise<User>
{
    const newUser: User = {
        uid: '',
        username, 
        email,
        avatar: '',
        level: 0,
        xp: 0,
        selectedDifficulty: 'Fundamentals',
        questionsAnswered: 0
    }

    const credentials = await createUserWithEmailAndPassword(auth, email, password)
    const uid = credentials.user.uid;
    newUser.uid = uid;

    await setDoc(doc(db, 'users', uid).withConverter(userConverter), newUser)

    return newUser
}

async function getUser(uid: string): Promise<User | null>
{
    const docRef = doc(db, 'users', uid).withConverter(userConverter)
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
        return docSnapshot.data()
    }
    else {
        return null
    }
    
}

async function getCurrentUser(): Promise<User | null>
{
    if (!auth.currentUser) return null

    const uid = auth.currentUser.uid
    const user = await getUser(uid)

    return user
}

async function updateCurrentUser(data: Partial<User>)
{
    if (!auth.currentUser) return

    const uid = auth.currentUser.uid

    await updateDoc(doc(db, 'users', uid).withConverter(userConverter), data)
}

export { createUser, getCurrentUser, updateCurrentUser }
import {
    type DocumentData,
    type FirestoreDataConverter,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    where,
  } from "firebase/firestore";
import { db } from "../firebase";

type Lesson = {
    question: string;
    explanation: string;
    difficulty: string;
}

const lessonConverter: FirestoreDataConverter<Lesson> = {
    toFirestore: (lesson: Lesson) => {
        return {
            question: lesson.question,
            explanation: lesson.explanation,
            difficulty: lesson.difficulty
        }
    },
    fromFirestore: (snapshot, options): Lesson => {
        const data = snapshot.data(options);
        return {
            question: data.question,
            explanation: data.explanation,
            difficulty: data.difficulty
        }
    },
}

async function getLessonsByDifficulty(difficulty: string, count: number): Promise<Lesson[]> {
    const q = query(
        collection(db, "questions").withConverter(lessonConverter),
        where("difficulty", "==", difficulty),
        limit(count),
    );

    const questions = await getDocs(q);
    let lessons: Lesson[] = []
    questions.docs.values().forEach((docSnap) => {
        const lesson: Lesson = docSnap.data()
        lessons.push(lesson)
    })

    return lessons;
}
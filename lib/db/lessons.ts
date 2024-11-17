import {
  type FirestoreDataConverter,
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export type Lesson = {
  question: string;
  explanation: string;
  difficulty: string;
};

const lessonConverter: FirestoreDataConverter<Lesson> = {
  toFirestore: (lesson: Lesson) => {
    return {
      question: lesson.question,
      explanation: lesson.explanation,
      difficulty: lesson.difficulty,
    };
  },
  fromFirestore: (snapshot, options): Lesson => {
    const data = snapshot.data(options);
    return {
      question: data.question,
      explanation: data.explanation,
      difficulty: data.difficulty,
    };
  },
};

async function getLessonsByDifficulty(
  difficulty?: string,
  count: number = 10,
): Promise<Lesson[]> {
  const q = query(
    collection(db, "lessons").withConverter(lessonConverter),
    ...(difficulty ? [where("difficulty", "==", difficulty)] : []),
    limit(count),
  );

  const questions = await getDocs(q);
  const lessons: Lesson[] = [];
  for (const docSnap of questions.docs) {
    const lesson: Lesson = docSnap.data();
    lessons.push(lesson);
  }

  return lessons;
}

export { getLessonsByDifficulty };

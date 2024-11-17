import {
  type DocumentData,
  type FirestoreDataConverter,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { validateAnswer } from "../openai";
import { getCurrentUser, updateCurrentUser } from "./users";

const difficultyMultipliers: { [id: string]: number } = {
  Fundamentals: 0.5,
  Basic: 1,
  Advanced: 1.5,
};

const AnswerBasePoints = 50;

export type Question = {
  question: string;
  answer: string;
  possibleAnswers: string[];
  difficulty: string;
};

const questionConverter: FirestoreDataConverter<Question> = {
  toFirestore: (question: Question): DocumentData => {
    return {
      question: question.question,
      answer: question.answer,
      difficuty: question.difficulty,
      possibleAnswers: question.possibleAnswers,
    };
  },
  fromFirestore: (snapshot, options): Question => {
    const data = snapshot.data(options);
    return {
      question: data.question,
      answer: data.answer,
      difficulty: data.difficulty,
      possibleAnswers: data.possibleAnswers,
    };
  },
};

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function getQuestionsByDifficulty(difficulty: string, count: number) {
  console.log("Querying for difficulty:", difficulty); // Add debug log
  const q = query(
    collection(db, "questions").withConverter(questionConverter),
    where("difficulty", "==", difficulty), // Add toLowerCase()
  ).withConverter(questionConverter);
  let questions: any;
  try {
    questions = await getDocs(q);
  } catch (e: any) {
    console.error(e.message);
  }
  console.log("Found questions:", questions.size); // Add debug log

  // Convert to array, shuffle, and limit to requested count
  const shuffledDocs = shuffle(Array.from(questions.docs));
  return shuffledDocs.slice(0, count);
}

async function checkAnswer(
  id: string,
  input: string,
  timerSecondsLeft: number,
): Promise<boolean> {
  const docSnapshot = await getDoc(
    doc(db, "questions", id).withConverter(questionConverter),
  );

  if (docSnapshot.exists()) {
    const question = docSnapshot.data();
    const points = timerSecondsLeft * AnswerBasePoints;
    const addedXp = points * difficultyMultipliers[question.difficulty];

    let isCorrect = false;
    if (question.difficulty === "Advanced") {
      isCorrect = await validateAnswer(
        question.answer,
        input,
        question.question,
      );

      console.log("Answer validation result from chatgpt:", isCorrect); // Add debug log
    } else {
      isCorrect = question.answer === input;
    }

    const user = await getCurrentUser();
    if (user !== null && isCorrect) {
      user.xp += addedXp;
      await updateCurrentUser(user);
    }

    return isCorrect;
  }

  return false;
}

export { checkAnswer, getQuestionsByDifficulty };

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
import { validateAnswer } from "../openai";
import { getCurrentUser, updateCurrentUser } from "./users";

const difficultyMultipliers: { [id: string]: number } = {
  Fundamentals: 0.5,
  Basic: 1,
  Advanced: 1.5,
};

const AnswerBasePoints = 50;

type Question = {
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

async function getQuestionsByDifficulty(difficuty: string, count: number) {
  const q = query(
    collection(db, "questions").withConverter(questionConverter),
    where("difficulty", "==", difficuty),
    limit(count),
  );

  const questions = await getDocs(q);
  return questions.docs.values();
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
    if (question.difficulty === "Basic") {
      // Use AI validation for basic difficulty
      isCorrect = await validateAnswer(
        question.answer,
        input,
        question.question,
      );
    } else {
      // Use exact match for other difficulties
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

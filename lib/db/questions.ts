import { db } from "../firebase";
import { doc, DocumentData, FirestoreDataConverter, getDocs, getDoc, query, collection, where, limit } from "firebase/firestore";
import { getCurrentUser, updateCurrentUser } from "./users";

const difficultyMultipliers: { [id: string]: number } = {
    Fundamentals: 0.5,
    Basic: 1,
    Advanced: 1.5
}

const AnswerBasePoints = 50

type Question = {
    question: string,
    answer: string,
    difficulty: string
}

const questionConverter: FirestoreDataConverter<Question> = {
    toFirestore: (question: Question): DocumentData => {
        return {
            question: question.question,
            answer: question.answer,
            difficuty: question.difficulty
        }
    },
    fromFirestore: (snapshot: any, options: any): Question => {
        const data = snapshot.data(options);
        return {
            question: data.question,
            answer: data.answer,
            difficulty: data.difficulty
        }
    }
}

async function getQuestionsByDifficulty(difficuty: string, count: number)
{
    const q = query(
        collection(db, 'questions').withConverter(questionConverter),
        where('difficulty', '==', difficuty), 
        limit(count)
    )

    const questions = await getDocs(q)
    return questions.docs.values()
}

async function checkAnswer(id: string, input: string, timerSecondsLeft: number): Promise<boolean>
{
    const docSnapshot = await getDoc(doc(db, 'questions', id).withConverter(questionConverter))   

    if (docSnapshot.exists()) {
        const question = docSnapshot.data()

        const points = timerSecondsLeft * AnswerBasePoints;
        const addedXp = points * difficultyMultipliers[question.difficulty]

        const user = await getCurrentUser()
    
        if (user !== null) {
            user.xp += addedXp

            await updateCurrentUser(user)
        }

        return (question.answer === input)
    }
    else {
        return false
    }
}
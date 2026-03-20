/**
 * LearningQuestionsList — список вопросов для обучения
 *
 * @description Отображение списка вопросов с ответами
 * @author el-bez Team
 * @version 2.1.0 (Исправление ошибок множественного выбора)
 */

import { LearningQuestionCard } from './LearningQuestionCard';
import type { LearningQuestionsListProps } from '../types';
import type { Question } from '@/types';

export function LearningQuestionsList({
  quizState,
  showSources,
  onAnswerSelect,
  onToggleSource,
}: Omit<LearningQuestionsListProps, 'questions'>) {
  return (
    <div className="space-y-6">
      {quizState.currentQuestions.map((question: Question, qIdx: number) => {
        const userAnswer = quizState.userAnswers[qIdx];
        const correctAnswers = Array.isArray(question.correct) ? question.correct : [question.correct];
        const expectedCount = correctAnswers.length;
        
        // Для множественного выбора: isAnswered=true только если выбраны все ответы
        // Для одиночного выбора: isAnswered=true если есть любой ответ
        const isAnswered = userAnswer !== null && (
          Array.isArray(userAnswer)
            ? userAnswer.length >= expectedCount
            : expectedCount === 1
        );

        return (
          <LearningQuestionCard
            key={question.id}
            question={question}
            questionIndex={qIdx}
            shuffledAnswers={quizState.shuffledAnswers[qIdx]}
            userAnswer={userAnswer}
            isAnswered={isAnswered}
            showSources={showSources[qIdx]}
            onAnswerSelect={onAnswerSelect}
            onToggleSource={onToggleSource}
          />
        );
      })}
    </div>
  );
}

export default LearningQuestionsList;

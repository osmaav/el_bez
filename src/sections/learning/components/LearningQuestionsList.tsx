/**
 * LearningQuestionsList — список вопросов для обучения
 * 
 * @description Отображение списка вопросов с ответами
 * @author el-bez Team
 * @version 1.0.0
 */

import { LearningQuestionCard } from './LearningQuestionCard';
import type { QuestionsListProps } from '../types';

export function LearningQuestionsList({
  quizState,
  showSources,
  onAnswerSelect,
  onToggleSource,
}: Omit<QuestionsListProps, 'questions'>) {
  return (
    <div className="space-y-6">
      {quizState.currentQuestions.map((question, qIdx) => (
        <LearningQuestionCard
          key={question.id}
          question={question}
          questionIndex={qIdx}
          shuffledAnswers={quizState.shuffledAnswers[qIdx]}
          userAnswer={quizState.userAnswers[qIdx]}
          isAnswered={quizState.userAnswers[qIdx] !== null}
          showSources={showSources[qIdx]}
          onAnswerSelect={onAnswerSelect}
          onToggleSource={onToggleSource}
        />
      ))}
    </div>
  );
}

export default LearningQuestionsList;

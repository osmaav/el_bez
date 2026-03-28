/**
 * LearningQuestionCard — карточка вопроса для обучения
 *
 * @description Отображение вопроса с вариантами ответов и источником
 * @author el-bez Team
 * @version 3.0.0 (Декомпозированная версия)
 */

import { Card, CardContent } from '@/components/ui/card';
import { checkAnswer } from '@/utils/answerValidator';
import type { Question } from '@/types';

import { QuestionHeader } from './QuestionHeader';
import { QuestionText } from './QuestionText';
import { AnswerOptions } from './AnswerOptions';
import { QuestionSource } from './QuestionSource';

export interface LearningQuestionCardProps {
  question: Question;
  questionIndex: number;
  shuffledAnswers: number[];
  userAnswer: number | number[] | null;
  isAnswered: boolean;
  showSources: boolean;
  onAnswerSelect: (questionIndex: number, answerIndex: number | number[]) => void;
  onToggleSource: (questionIndex: number) => void;
}

export function LearningQuestionCard({
  question,
  questionIndex,
  shuffledAnswers,
  userAnswer,
  isAnswered,
  showSources,
  onAnswerSelect,
  onToggleSource,
}: LearningQuestionCardProps) {
  // Определяем тип вопроса (одиночный или множественный выбор)
  const correctAns = question.correct;
  const correctAnswers: number[] = Array.isArray(correctAns)
    ? correctAns.flatMap(n => typeof n === 'number' ? [n] : [])
    : [correctAns].flatMap(n => typeof n === 'number' ? [n] : []);

  // Нормализуем userAnswer к массиву
  const userAnswersArray = userAnswer === null ? [] : Array.isArray(userAnswer) ? userAnswer : [userAnswer];

  // Проверка правильности ответа
  const isCorrect = isAnswered && checkAnswer(
    userAnswersArray.flatMap(idx => {
      const val = shuffledAnswers[idx];
      return val != null ? [val] : [];
    }),
    correctAnswers
  );

  // Обработчик выбора ответа
  const handleAnswerSelect = (shuffledIndex: number) => {
    onAnswerSelect(questionIndex, shuffledIndex);
  };

  return (
    <Card className="overflow-hidden gap-2 py-2">
      <QuestionHeader
        questionId={question.id}
        ticketId={question.ticket}
        isCorrect={isCorrect}
        isAnswered={isAnswered}
      />

      <CardContent className="px-2 sm:px-4">
        <QuestionText text={question.question ?? question.text} />

        <AnswerOptions
          shuffledAnswers={shuffledAnswers}
          options={question.answers || question.options}
          correctAnswers={correctAnswers}
          userAnswers={userAnswersArray}
          isAnswered={isAnswered}
          onAnswerSelect={handleAnswerSelect}
        />

        <QuestionSource
          sourceText={question.link ?? ''}
          isExpanded={showSources}
          isAnswered={isAnswered}
          onToggle={() => onToggleSource(questionIndex)}
        />
      </CardContent>
    </Card>
  );
}

export default LearningQuestionCard;

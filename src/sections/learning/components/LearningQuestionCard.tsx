/**
 * LearningQuestionCard — карточка вопроса для обучения
 *
 * @description Отображение вопроса с вариантами ответов и источником
 * @author el-bez Team
 * @version 2.1.0 (Исправление ошибок множественного выбора)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import type { QuestionCardProps } from '../types';
import { checkAnswer } from '@/utils/answerValidator';

export function LearningQuestionCard({
  question,
  questionIndex,
  shuffledAnswers,
  userAnswer,
  isAnswered,
  showSources,
  onAnswerSelect,
  onToggleSource,
}: QuestionCardProps) {
  // Определяем тип вопроса (одиночный или множественный выбор)
  const correctAnswers = Array.isArray(question.correct) ? question.correct : [question.correct];
  const expectedCount = correctAnswers.length;

  // Нормализуем userAnswer к массиву
  const userAnswersArray = userAnswer === null ? [] : Array.isArray(userAnswer) ? userAnswer : [userAnswer];

  // Проверяем, выбрано ли достаточное количество ответов
  const isAllAnswersSelected = userAnswersArray.length >= expectedCount;

  // Получение стиля для ответа
  const getAnswerStyle = (shuffledIndex: number) => {
    const originalIndex = shuffledAnswers[shuffledIndex];

    if (!isAnswered) {
      // Не отвечено - проверяем выбран ли этот вариант
      if (userAnswersArray.includes(shuffledIndex)) {
        return 'bg-blue-100 border-blue-500 text-blue-900';
      }
      return 'bg-white hover:bg-slate-50 border-slate-200';
    }

    // Ответ дан - показываем правильные/неправильные
    if (correctAnswers.includes(originalIndex)) {
      return 'bg-green-100 border-green-500 text-green-900';
    }

    if (userAnswersArray.includes(shuffledIndex)) {
      return 'bg-orange-100 border-orange-500 text-orange-900 border-2';
    }

    return 'bg-slate-50 border-slate-200 opacity-50';
  };

  // Обработчик клика
  const handleAnswerClick = (shuffledIndex: number) => {
    if (isAnswered) return;

    if (expectedCount > 1) {
      // Множественный выбор - добавляем/удаляем из массива
      const newAnswers = userAnswersArray.includes(shuffledIndex)
        ? userAnswersArray.filter(idx => idx !== shuffledIndex)
        : [...userAnswersArray, shuffledIndex];

      // Разрешаем выбирать только до expectedCount ответов
      if (newAnswers.length <= expectedCount) {
        onAnswerSelect(questionIndex, newAnswers);
      }
    } else {
      // Одиночный выбор - сразу отправляем ответ
      onAnswerSelect(questionIndex, shuffledIndex);
    }
  };

  // Проверка правильности ответа (только если выбраны все ответы)
  const isCorrect = isAnswered && isAllAnswersSelected && checkAnswer(
    userAnswersArray.map(idx => shuffledAnswers[idx]),
    correctAnswers
  );

  return (
    <Card className="overflow-hidden py-2">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-start justify-between">
          <CardTitle className="font-medium">Вопрос {question.id}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-0 whitespace-normal">
              Билет №{question.ticket}
            </Badge>
            {isAnswered && (
              isCorrect
                ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                : <XCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Текст вопроса */}
        <p className="text-slate-800 mb-6 leading-relaxed">{question.question}</p>

        {/* Варианты ответов */}
        <div className="space-y-3">
          {shuffledAnswers.map((originalIdx, shuffledIdx) => (
            <button
              key={shuffledIdx}
              onClick={() => handleAnswerClick(shuffledIdx)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${getAnswerStyle(shuffledIdx)} hover:shadow-md disabled:cursor-default`}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(1040 + shuffledIdx)}
                </span>
                <span className="flex-1">{question.answers?.[originalIdx] || question.options[originalIdx]}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Источник */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleSource(questionIndex)}
            disabled={!isAnswered}
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Источник
          </Button>
          {showSources && (
            <Badge className="animate-in fade-in border-0 bg-transparent text-slate-600 max-w-full break-words text-left font-normal whitespace-normal rounded">
              {question.link}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default LearningQuestionCard;

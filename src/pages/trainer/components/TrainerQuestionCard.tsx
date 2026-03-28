/**
 * TrainerQuestionCard - Карточка вопроса тренажёра
 * 
 * @description Отображение вопроса с вариантами ответов
 * @author el-bez Team
 * @version 1.0.0
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { TrainerQuestionCardProps } from '../types';

export function TrainerQuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  disabled = false,
}: Omit<TrainerQuestionCardProps, 'questionIndex'>) {
  const handleClick = (idx: number) => {
    if (disabled) return;

    const correctAnswers = Array.isArray(question.correct_index)
      ? question.correct_index
      : [question.correct_index];
    const expectedCount = correctAnswers.length;

    if (expectedCount > 1) {
      // Множественный выбор - переключаем ответ
      const currentAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [];
      const newAnswers = currentAnswers.includes(idx)
        ? currentAnswers.filter(a => a !== idx)
        : [...currentAnswers, idx];
      onAnswerSelect(newAnswers);
    } else {
      // Одиночный выбор
      onAnswerSelect(idx);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="border-b bg-slate-50">
        <Badge variant="outline">Вопрос #{question.id}</Badge>
      </CardHeader>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">
          {question.text}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = Array.isArray(selectedAnswer)
              ? selectedAnswer.includes(idx)
              : selectedAnswer === idx;

            return (
              <button
                key={idx}
                onClick={() => handleClick(idx)}
                disabled={disabled}
                className={`
                  w-full p-4 text-left rounded-lg border-2 transition-all
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                    }
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default TrainerQuestionCard;

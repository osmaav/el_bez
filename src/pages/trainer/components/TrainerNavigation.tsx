/**
 * TrainerNavigation - Навигация по вопросам тренажёра
 * 
 * @description Кнопки навигации и сетка вопросов
 * @author el-bez Team
 * @version 1.0.0
 */

import { ChevronLeft, ChevronRight, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TrainerNavigationProps } from '../types';

export function TrainerNavigation({
  currentIndex,
  totalQuestions,
  answers,
  onPrevious,
  onNext,
  onFinish,
  onQuestionSelect,
}: TrainerNavigationProps) {
  const answeredCount = Object.keys(answers).length;

  return (
    <>
      {/* Прогресс */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">
            Вопрос {currentIndex + 1} из {totalQuestions}
          </span>
          <span className="text-sm text-slate-600">
            Отвечено: {answeredCount} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Сетка вопросов */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: totalQuestions }, (_, idx) => {
          const isAnswered = answers[idx] !== undefined;
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={idx}
              onClick={() => onQuestionSelect(idx)}
              className={`
                w-10 h-10 rounded-lg font-medium text-sm transition-all
                ${isCurrent
                  ? 'bg-blue-500 text-white'
                  : isAnswered
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Кнопки навигации */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Предыдущий
        </Button>

        {currentIndex < totalQuestions - 1 ? (
          <Button
            onClick={onNext}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Следующий
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={onFinish}
            className="bg-green-600 hover:bg-green-700"
          >
            Завершить
            <FileCheck className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </>
  );
}

export default TrainerNavigation;

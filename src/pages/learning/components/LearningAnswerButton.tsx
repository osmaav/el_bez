/**
 * LearningAnswerButton - Кнопка ответа для обучения
 * 
 * @description Кнопка выбора ответа с поддержкой множественного выбора
 * @author el-bez Team
 * @version 1.0.0
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface LearningAnswerButtonProps {
  /** Индекс варианта ответа */
  index: number;
  /** Текст варианта */
  label: string;
  /** Выбран ли этот ответ */
  isSelected: boolean;
  /** Обработчик клика */
  onClick: () => void;
  /** Блокировка кнопки */
  disabled?: boolean;
  /** Множественный выбор */
  isMultipleChoice?: boolean;
}

export const LearningAnswerButton: React.FC<LearningAnswerButtonProps> = ({
  index,
  label,
  isSelected,
  onClick,
  disabled = false,
  isMultipleChoice = false,
}) => {
  const handleClick = () => {
    if (disabled) return;
    onClick();
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      variant="outline"
      className={cn(
        'w-full justify-start text-left h-auto py-4 px-4',
        isSelected && 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20',
        !isSelected && 'hover:bg-slate-50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-start gap-3 w-full">
        <div
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
            isSelected
              ? 'bg-blue-500 text-white'
              : 'bg-slate-200 text-slate-700'
          )}
        >
          {String.fromCharCode(65 + index)}
        </div>
        <span className="flex-1">{label}</span>
        {isMultipleChoice && (
          <div
            className={cn(
              'w-4 h-4 rounded border',
              isSelected
                ? 'bg-blue-500 border-blue-500'
                : 'border-slate-300'
            )}
          />
        )}
      </div>
    </Button>
  );
};

export default LearningAnswerButton;

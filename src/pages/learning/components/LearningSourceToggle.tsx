/**
 * LearningSourceToggle - Переключатель источника вопроса
 * 
 * @description Кнопка для показа/скрытия нормативного документа
 * @author el-bez Team
 * @version 1.0.0
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LearningSourceToggleProps {
  /** Показан ли источник */
  isExpanded: boolean;
  /** Текст источника */
  sourceText?: string;
  /** Обработчик переключения */
  onToggle: () => void;
}

export const LearningSourceToggle: React.FC<LearningSourceToggleProps> = ({
  isExpanded,
  sourceText,
  onToggle,
}) => {
  if (!sourceText) return null;

  return (
    <div className="mt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={cn(
          'text-xs text-blue-600 hover:text-blue-800 p-0 h-auto',
          isExpanded && 'text-blue-800'
        )}
      >
        <BookOpen className="w-3 h-3 mr-1" />
        Источник
        <ChevronDown
          className={cn(
            'w-3 h-3 ml-1 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </Button>

      {isExpanded && (
        <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
          {sourceText}
        </div>
      )}
    </div>
  );
};

export default LearningSourceToggle;

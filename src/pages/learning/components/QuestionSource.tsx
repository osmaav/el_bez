/**
 * QuestionSource - Источник вопроса
 * 
 * @description Отображение нормативного документа (источника)
 * @author el-bez Team
 * @version 1.0.0
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

export interface QuestionSourceProps {
  /** Текст источника */
  sourceText?: string;
  /** Показан ли источник */
  isExpanded: boolean;
  /** Дан ли ответ (блокировка) */
  isAnswered: boolean;
  /** Обработчик переключения */
  onToggle: () => void;
}

export function QuestionSource({
  sourceText,
  isExpanded,
  isAnswered,
  onToggle,
}: QuestionSourceProps) {
  if (!sourceText && !isExpanded) return null;

  return (
    <div className="mt-4 flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        disabled={!isAnswered}
        className="gap-2"
      >
        <BookOpen className="w-4 h-4" />
        Источник
      </Button>
      {isExpanded && (
        <Badge className="animate-in fade-in border-0 bg-transparent text-slate-600 max-w-full break-words text-left font-normal whitespace-normal rounded">
          {sourceText || 'Источник не указан'}
        </Badge>
      )}
    </div>
  );
}

export default QuestionSource;

/**
 * QuestionHeader - Заголовок вопроса
 * 
 * @description Отображение номера вопроса, билета и статуса
 * @author el-bez Team
 * @version 1.0.0
 */

import { CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface QuestionHeaderProps {
  /** ID вопроса */
  questionId: number;
  /** ID билета */
  ticketId: number;
  /** Правильно ли отвечено */
  isCorrect?: boolean;
  /** Дан ли ответ */
  isAnswered: boolean;
}

export function QuestionHeader({
  questionId,
  ticketId,
  isCorrect,
  isAnswered,
}: QuestionHeaderProps) {
  return (
    <CardHeader className="px-2 sm:px-4 bg-slate-50 border-b">
      <div className="flex items-start justify-between">
        <h3 className="mt-0.5 font-medium">Вопрос {questionId}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-0 whitespace-normal">
            Билет №{ticketId}
          </Badge>
          {isAnswered && (
            isCorrect
              ? <CheckCircle2 className="w-5 h-5 text-green-600" />
              : <XCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
      </div>
    </CardHeader>
  );
}

export default QuestionHeader;

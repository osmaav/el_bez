/**
 * TrainerQuestionCard — карточка вопроса для тренажёра
 * 
 * @description Отображение вопроса с вариантами ответов и навигацией
 * @author el-bez Team
 * @version 1.0.0
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import type { TrainerQuestionCardProps } from '../types';

export function TrainerQuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  isAnswered,
  isCorrect,
  onSelectAnswer,
  onNext,
  onPrev,
  canGoPrev,
  canGoNext,
}: Omit<TrainerQuestionCardProps, 'showExplanation'>) {
  // Получение стиля для ответа
  const getAnswerStyle = (answerIndex: number) => {
    if (!isAnswered) {
      return 'bg-white hover:bg-slate-50 border-slate-200';
    }

    if (answerIndex === question.correct_index) {
      return 'bg-green-100 border-green-500 text-green-900';
    }

    if (answerIndex === selectedAnswer && !isCorrect) {
      return 'bg-orange-100 border-orange-500 text-orange-900 border-2';
    }

    return 'bg-slate-50 border-slate-200 opacity-50';
  };

  return (
    <Card className="overflow-hidden py-2">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-medium">Вопрос {question.id}</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              {questionIndex + 1} из {totalQuestions}
            </p>
          </div>
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
          {question.answers?.map((answer, answerIndex) => (
            <button
              key={answerIndex}
              onClick={() => onSelectAnswer(answerIndex)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${getAnswerStyle(answerIndex)} hover:shadow-md disabled:cursor-default`}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(1040 + answerIndex)}
                </span>
                <span className="flex-1">{answer}</span>
              </div>
            </button>
          ))}
        </div>
        
        {/* Навигация и источник */}
        <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden md:inline ml-1">Назад</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={!canGoNext || !isAnswered}
            >
              <span className="hidden md:inline mr-1">Далее</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {question.link && (
            <Badge className="border-0 bg-transparent text-slate-600 max-w-full break-words text-left font-normal whitespace-normal rounded">
              <BookOpen className="w-3 h-3 inline mr-1" />
              {question.link}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TrainerQuestionCard;

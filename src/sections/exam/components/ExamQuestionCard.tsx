/**
 * ExamQuestionCard — карточка вопроса для экзамена
 * 
 * @description Отображение вопроса с вариантами ответов
 * @author el-bez Team
 * @version 1.0.0
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ExamQuestionCardProps } from '../types';

export function ExamQuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  isAnswered,
  onSelectAnswer,
  onNext,
  onPrev,
  canGoPrev,
  canGoNext,
}: ExamQuestionCardProps) {
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
          <Badge variant="outline" className="border-0 whitespace-normal">
            Билет №{question.ticket}
          </Badge>
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
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                selectedAnswer === answerIndex
                  ? 'bg-blue-100 border-blue-500 text-blue-900'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              } hover:shadow-md disabled:cursor-default`}
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
        
        {/* Навигация */}
        <div className="mt-4 flex items-center justify-between gap-2">
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
      </CardContent>
    </Card>
  );
}

export default ExamQuestionCard;

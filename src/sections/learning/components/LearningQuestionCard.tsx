/**
 * LearningQuestionCard — карточка вопроса для обучения
 * 
 * @description Отображение вопроса с вариантами ответов и источником
 * @author el-bez Team
 * @version 1.0.0
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import type { QuestionCardProps } from '../types';

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
  // Получение стиля для ответа
  const getAnswerStyle = (shuffledIndex: number) => {
    const correctOriginalIndex = question.correct;
    const originalIndex = shuffledAnswers[shuffledIndex];

    if (userAnswer === null) {
      return 'bg-white hover:bg-slate-50 border-slate-200';
    }

    if (originalIndex === correctOriginalIndex) {
      return 'bg-green-100 border-green-500 text-green-900';
    }

    if (shuffledIndex === userAnswer && originalIndex !== correctOriginalIndex) {
      return 'bg-orange-100 border-orange-500 text-orange-900 border-2';
    }

    return 'bg-slate-50 border-slate-200 opacity-50';
  };

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
              userAnswer === shuffledAnswers.findIndex((idx) => idx === question.correct)
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
              onClick={() => onAnswerSelect(questionIndex, shuffledIdx)}
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

/**
 * LearningQuestionCard — компонент карточки вопроса обучения
 * 
 * @description Отображает вопрос с вариантами ответов, статусом
 * и источником. Поддерживает выбор ответа и просмотр источника.
 */

import { useState } from 'react';
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Question } from '@/types';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LearningQuestionCardProps {
  question: Question;
  questionIndex: number;
  shuffledAnswers: number[];
  userAnswer: number | null;
  
  // Actions
  onAnswerSelect: (questionIndex: number, answerIndex: number) => void;
  
  // Helpers
  getAnswerStyle: (questionIndex: number, shuffledIndex: number) => string;
}

// ============================================================================
// Component Implementation
// ============================================================================

export function LearningQuestionCard({
  question,
  questionIndex,
  shuffledAnswers,
  userAnswer,
  onAnswerSelect,
  getAnswerStyle,
}: LearningQuestionCardProps) {
  const [showSource, setShowSource] = useState(false);

  const isAnswered = userAnswer !== null;
  const isCorrect = isAnswered && shuffledAnswers[userAnswer] === (question.correct ?? 0);

  return (
    <Card className="overflow-hidden py-2 sm:py-3 md:py-4 gap-2 sm:gap-4">
      <CardHeader className="bg-slate-50 border-b px-2 sm:px-6">
        <div className="flex items-start justify-between">
          <CardTitle className="font-medium">Вопрос {question.id}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-0 whitespace-normal py-0 sm:py-0.5">
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
      
      <CardContent className='px-2 sm:px-4'>
        {/* Question Text */}
        <p className="text-slate-800 mb-2 sm:mb-6 sm:leading-relaxed">
          {question.question}
        </p>

        {/* Answer Options */}
        <div className="space-y-2">
          {shuffledAnswers.map((originalIdx, shuffledIdx) => (
            <button
              key={shuffledIdx}
              onClick={() => onAnswerSelect(questionIndex, shuffledIdx)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${getAnswerStyle(questionIndex, shuffledIdx)} hover:shadow-md disabled:cursor-default`}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(1040 + shuffledIdx)}
                </span>
                <span className="flex-1">
                  {question.answers?.[originalIdx] || question.options[originalIdx]}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Source Toggle */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSource(prev => !prev)}
            disabled={!isAnswered}
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Источник
          </Button>
          
          {showSource && question.link && (
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

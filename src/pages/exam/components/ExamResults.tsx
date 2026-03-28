/**
 * ExamResults - Результаты экзамена
 * 
 * @description Отображение результатов экзамена
 * @author el-bez Team
 * @version 1.0.0
 */

import { Trophy, AlertCircle, CheckCircle2, XCircle, RotateCcw, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ExamResultsProps } from '../types';

export function ExamResults({
  stats,
  ticket,
  answers,
  results,
  onReset,
  onExport,
}: ExamResultsProps) {
  const passed = stats.percentage >= 80;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Результаты экзамена</h2>
        <p className="text-slate-600 mt-2">Билет #{ticket.id}</p>
      </div>

      {/* Карточка результата */}
      <Card className={`mb-8 ${passed ? 'border-green-500' : 'border-red-500'}`}>
        <CardContent className="p-8 text-center">
          <div className={`
            w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6
            ${passed ? 'bg-green-100' : 'bg-red-100'}
          `}>
            {passed ? (
              <Trophy className="w-12 h-12 text-green-600" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-600" />
            )}
          </div>

          <h3 className={`
            text-3xl font-bold mb-2
            ${passed ? 'text-green-700' : 'text-red-700'}
          `}>
            {passed ? 'Экзамен сдан!' : 'Экзамен не сдан'}
          </h3>

          <div className="text-6xl font-bold text-slate-900 mb-4">
            {stats.percentage}%
          </div>

          <p className="text-slate-600 mb-6">
            Правильных ответов: {stats.correct} из {stats.total}
          </p>

          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">{stats.correct}</span>
              </div>
              <span className="text-sm text-slate-500">Верно</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">{stats.total - stats.correct}</span>
              </div>
              <span className="text-sm text-slate-500">Неверно</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Детальный разбор */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Разбор вопросов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {ticket.questions.map((q, idx) => {
              const isCorrect = results[q.id];
              const userAnswer = answers[q.id];
              const correctAnswers = Array.isArray(q.correct_index) ? q.correct_index : [q.correct_index];

              const getUserAnswerText = () => {
                if (userAnswer === undefined) return 'Не отвечено';
                const ans = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
                return ans.map(i => q.options[i]).join(', ');
              };

              const getCorrectAnswerText = () => {
                return correctAnswers.map(i => q.options[i]).join(', ');
              };

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 mb-2">
                        {idx + 1}. {q.text}
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                          <span className="font-medium">Ваш ответ:</span> {getUserAnswerText()}
                        </p>
                        {!isCorrect && (
                          <p className="text-green-700">
                            <span className="font-medium">Правильный ответ:</span> {getCorrectAnswerText()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Кнопки действий */}
      <div className="flex justify-center space-x-4 flex-wrap gap-4">
        <Button
          size="lg"
          onClick={onExport}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-5 h-5 mr-2" />
          Сохранить в PDF
        </Button>
        <Button
          size="lg"
          onClick={onReset}
          className="bg-yellow-500 hover:bg-yellow-600"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Выбрать другой билет
        </Button>
      </div>
    </div>
  );
}

export default ExamResults;

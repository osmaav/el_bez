/**
 * TrainerStartScreen - Экран запуска тренажёра
 * 
 * @description Выбор количества вопросов для тренировки
 * @author el-bez Team
 * @version 1.0.0
 */

import { GraduationCap, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { TrainerStartScreenProps } from '../types';

export function TrainerStartScreen({
  availableQuestions,
  onStart,
  hasFilters,
}: TrainerStartScreenProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Тренажёр</h2>
        <p className="text-slate-600 mt-2">
          Тренировка со случайной выборкой вопросов
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStart(20)}
        >
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="font-bold text-xl text-slate-900">20 вопросов</h3>
            <p className="text-sm text-slate-500 mt-2">
              Быстрая тренировка
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onStart(50)}
        >
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="font-bold text-xl text-slate-900">50 вопросов</h3>
            <p className="text-sm text-slate-500 mt-2">
              Полная тренировка
            </p>
          </CardContent>
        </Card>
      </div>

      {hasFilters && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900">Активны фильтры вопросов</h4>
              <p className="text-sm text-yellow-800 mt-1">
                Вопросы будут выбраны из отфильтрованного пула ({availableQuestions} доступно)
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasFilters && availableQuestions < 50 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Доступно вопросов</h4>
              <p className="text-sm text-blue-800 mt-1">
                В текущем разделе доступно {availableQuestions} вопросов
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainerStartScreen;

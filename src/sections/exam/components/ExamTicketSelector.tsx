/**
 * ExamTicketSelector — выбор билета для экзамена
 * 
 * @description Отображение списка билетов для выбора
 * @author el-bez Team
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Shuffle } from 'lucide-react';
import type { ExamTicketSelectorProps } from '../types';

export function ExamTicketSelector({
  tickets,
  onSelectTicket,
  onStartRandom,
}: ExamTicketSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Экзамен
        </h1>
        <p className="text-sm text-slate-600">
          Выберите билет или начните со случайными вопросами
        </p>
      </div>

      {/* Случайный старт */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Shuffle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Случайные вопросы</h3>
                <p className="text-sm text-slate-600">
                  10 случайных вопросов из всех билетов
                </p>
              </div>
            </div>
            <Button
              onClick={onStartRandom}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Начать
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Список билетов */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map(ticket => (
          <Card
            key={ticket.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelectTicket(ticket.id)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Билет {ticket.id}</h3>
                    <p className="text-xs text-slate-500">
                      {ticket.questions.length} вопросов
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  10 вопросов
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Информация */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="font-bold text-slate-900 mb-4">О экзамене</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              Выберите билет из списка или начните со случайными вопросами
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              10 вопросов в билете
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              Навигация между вопросами
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              Результаты по завершении
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Вспомогательный компонент для иконки
function CheckCircle2({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <span className={className}>{children}</span>;
}

export default ExamTicketSelector;

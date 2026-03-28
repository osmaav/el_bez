/**
 * ExamTicketSelect - Экран выбора билета
 * 
 * @description Выбор билета для экзамена
 * @author el-bez Team
 * @version 1.0.0
 */

import { GraduationCap, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ExamTicketSelectProps } from '../types';

export function ExamTicketSelect({
  tickets,
  onSelectTicket,
  sectionInfo,
  isLoading,
}: ExamTicketSelectProps) {
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Загрузка...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-2">

      <div className="mb-2">
        <h2 className="text-2xl font-bold text-slate-900">Экзамен</h2>
        <p className="text-slate-600 mt-2">
          {sectionInfo?.name} — {sectionInfo?.description} • {tickets.length} билета(ов)
        </p>
      </div>

      <div className="mb-2 space-y-2">

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Информация об экзамене</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• В каждом Билете по 10 вопросов</li>
                <li>• Для успешной сдачи необходимо правильно ответить на 80% вопросов (8 из 10)</li>
                <li>• На каждый вопрос даётся один ответ</li>
                <li>• После завершения экзамена вы увидите результаты</li>
                <li>• Можно вернуться к предыдущим вопросам</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900">Внимание! Лимит времени</h4>
              <ul className="text-sm text-red-800 space-y-1 mt-1">
                <li>• На экзамен отводится <strong>20 минут</strong></li>
                <li>• Таймер продолжает отсчет при переходе в другие разделы</li>
                <li>• По истечении времени экзамен завершается автоматически</li>
                <li>• Все несохраненные ответы будут потеряны</li>
              </ul>
            </div>
          </div>
        </div>
      </div>



      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="cursor-pointer hover:shadow-lg transition-shadow py-0"
            onClick={() => onSelectTicket(ticket.id)}
          >
            <CardContent className="p-2 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Билет {ticket.id}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}

export default ExamTicketSelect;

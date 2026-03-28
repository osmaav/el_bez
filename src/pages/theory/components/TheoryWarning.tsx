/**
 * TheoryWarning - Предупреждение
 * 
 * @description Блок с важным предупреждением
 * @author el-bez Team
 * @version 1.0.0
 */

import { AlertTriangle } from 'lucide-react';

export interface TheoryWarningProps {
  title?: string;
  message?: string;
}

export function TheoryWarning({
  title = 'Важно!',
  message = 'Данный материал является вводным. Для успешной сдачи экзамена необходимо изучать полные тексты нормативных документов и актуальные вопросы тестов Ростехнадзора.',
}: TheoryWarningProps) {
  return (
    <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200 flex gap-3">
      <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
      <div>
        <h4 className="font-bold text-yellow-800 text-sm">{title}</h4>
        <p className="text-sm text-yellow-700 mt-1">{message}</p>
      </div>
    </div>
  );
}

export default TheoryWarning;

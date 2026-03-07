/**
 * StatisticsHeader — заголовок статистики
 * 
 * @description Заголовок с названием и описанием
 * @author el-bez Team
 * @version 1.0.0
 */

import { TrendingUp } from 'lucide-react';

export function StatisticsHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <TrendingUp className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-900">Статистика</h1>
      </div>
      <p className="text-slate-600">
        Ваш прогресс в подготовке по электробезопасности
      </p>
    </div>
  );
}

export default StatisticsHeader;

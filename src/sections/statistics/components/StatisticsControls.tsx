/**
 * StatisticsControls — контролы для статистики
 * 
 * @description Кнопки экспорта, очистки, загрузки тестовых данных
 * @author el-bez Team
 * @version 1.0.0
 */

import { Button } from '@/components/ui/button';
import { Download, RotateCcw, Database } from 'lucide-react';
import type { StatisticsControlsProps } from '../types';

export function StatisticsControls({
  onExport,
  onClear,
  onLoadTestData,
}: StatisticsControlsProps) {
  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Экспорт
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onClear}
        className="gap-2 text-red-600 hover:text-red-700"
      >
        <RotateCcw className="w-4 h-4" />
        Очистить
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onLoadTestData}
        className="gap-2"
      >
        <Database className="w-4 h-4" />
        Тестовые данные
      </Button>
    </div>
  );
}

export default StatisticsControls;

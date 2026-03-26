/**
 * ExamTimer — компонент таймера для экзамена
 * 
 * @description Отображает оставшееся время экзамена (30 минут)
 * @author el-bez Team
 * @version 1.0.0
 */

import { Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExamTimerProps {
  timeLeft: number;
  formattedTime: string;
  isActive: boolean;
  isFinished: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function ExamTimer({
  timeLeft,
  formattedTime,
  isActive,
  isFinished,
  onStart,
  onStop,
  onReset,
  disabled = false,
}: ExamTimerProps) {
  // Определение цвета таймера в зависимости от оставшегося времени
  const getTimerColor = () => {
    if (timeLeft <= 30) return 'text-red-600 bg-red-50 border-red-200';
    if (timeLeft <= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (timeLeft <= 300) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-slate-700 bg-slate-50 border-slate-200';
  };

  // Определение иконки
  const getIcon = () => {
    if (isFinished) return <AlertCircle className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  // Определение текста статуса
  const getStatusText = () => {
    if (isFinished) return 'Время вышло!';
    if (timeLeft <= 30) return 'Осталось 30 секунд!';
    if (timeLeft <= 60) return 'Осталась 1 минута!';
    if (timeLeft <= 300) return `Осталось ${Math.floor(timeLeft / 60)} минут`;
    return 'Время экзамена';
  };

  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-xl border-2 ${getTimerColor()} transition-colors duration-300`}>
      {/* Иконка */}
      <div className="flex-shrink-0">
        {getIcon()}
      </div>

      {/* Время */}
      <div className="flex-1">
        <div className="text-2xl font-bold font-mono tracking-wider">
          {formattedTime}
        </div>
        <div className="text-xs opacity-75">
          {getStatusText()}
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-2">
        {!isActive && !isFinished && (
          <Button
            size="sm"
            onClick={onStart}
            disabled={disabled}
            className="bg-green-600 hover:bg-green-700"
          >
            Старт
          </Button>
        )}

        {isActive && (
          <Button
            size="sm"
            variant="outline"
            onClick={onStop}
            disabled={disabled}
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            Пауза
          </Button>
        )}

        {!isActive && timeLeft < 1800 && !isFinished && (
          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            disabled={disabled}
          >
            Сброс
          </Button>
        )}
      </div>
    </div>
  );
}

export default ExamTimer;

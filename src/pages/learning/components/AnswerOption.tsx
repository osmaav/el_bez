/**
 * AnswerOption - Вариант ответа
 * 
 * @description Отдельный вариант ответа с буквой и текстом
 * @author el-bez Team
 * @version 1.0.0
 */

import { useAnswerStyle } from './hooks/useAnswerStyle';

export interface AnswerOptionProps {
  /** Индекс варианта в перемешанном списке */
  shuffledIndex: number;
  /** Оригинальный индекс варианта */
  originalIndex: number;
  /** Текст варианта */
  text: string;
  /** Массив правильных индексов */
  correctAnswers: number[];
  /** Массив выбранных пользователем индексов */
  userAnswers: number[];
  /** Дан ли уже ответ */
  isAnswered: boolean;
  /** Обработчик клика */
  onClick: (shuffledIndex: number) => void;
}

export function AnswerOption({
  shuffledIndex,
  originalIndex,
  text,
  correctAnswers,
  userAnswers,
  isAnswered,
  onClick,
}: AnswerOptionProps) {
  const isSelected = userAnswers.includes(shuffledIndex);

  const { className } = useAnswerStyle({
    shuffledIndex,
    originalIndex,
    correctAnswers,
    userAnswers,
    isAnswered,
    isSelected,
  });

  const handleClick = () => {
    if (!isAnswered) {
      onClick(shuffledIndex);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isAnswered}
      className={`w-full p-2 sm:p-4 rounded-xl border-2 text-left transition-all duration-200 ${className} hover:shadow-md disabled:cursor-default`}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
          {String.fromCharCode(1040 + shuffledIndex)}
        </span>
        <span className="flex-1">{text}</span>
      </div>
    </button>
  );
}

export default AnswerOption;

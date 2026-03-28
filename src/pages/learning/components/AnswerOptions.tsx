/**
 * AnswerOptions - Список вариантов ответов
 * 
 * @description Отображение всех вариантов ответа на вопрос
 * @author el-bez Team
 * @version 1.0.0
 */

import { AnswerOption } from './AnswerOption';
import { useMultipleChoice } from './hooks/useMultipleChoice';

export interface AnswerOptionsProps {
  /** Варианты ответов (перемешанные индексы) */
  shuffledAnswers: number[];
  /** Тексты вариантов */
  options: string[];
  /** Массив правильных индексов */
  correctAnswers: number[];
  /** Текущие выбранные ответы */
  userAnswers: number[];
  /** Дан ли уже ответ */
  isAnswered: boolean;
  /** Обработчик выбора */
  onAnswerSelect: (shuffledIndex: number) => void;
}

export function AnswerOptions({
  shuffledAnswers,
  options,
  correctAnswers,
  userAnswers,
  isAnswered,
  onAnswerSelect,
}: AnswerOptionsProps) {
  const expectedCount = correctAnswers.length;

  const { handleSelect } = useMultipleChoice({
    expectedCount,
    currentAnswers: userAnswers,
    isAnswered,
  });

  const handleClick = (shuffledIndex: number) => {
    const newAnswers = handleSelect(shuffledIndex);
    if (newAnswers !== userAnswers) {
      onAnswerSelect(shuffledIndex);
    }
  };

  return (
    <div className="space-y-3">
      {shuffledAnswers.map((originalIdx: number, shuffledIdx: number) => (
        <AnswerOption
          key={shuffledIdx}
          shuffledIndex={shuffledIdx}
          originalIndex={originalIdx}
          text={options[originalIdx]}
          correctAnswers={correctAnswers}
          userAnswers={userAnswers}
          isAnswered={isAnswered}
          onClick={handleClick}
        />
      ))}
    </div>
  );
}

export default AnswerOptions;

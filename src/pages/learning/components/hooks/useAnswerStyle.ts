/**
 * useAnswerStyle - Хук для вычисления стилей ответов
 * 
 * @description Определяет визуальный стиль варианта ответа в зависимости от состояния
 * @author el-bez Team
 * @version 1.0.0
 */

interface UseAnswerStyleOptions {
  /** Индекс варианта в перемешанном списке */
  shuffledIndex: number;
  /** Оригинальный индекс варианта */
  originalIndex: number;
  /** Массив правильных индексов */
  correctAnswers: number[];
  /** Массив выбранных пользователем индексов */
  userAnswers: number[];
  /** Дан ли уже ответ */
  isAnswered: boolean;
  /** Выбран ли текущий вариант */
  isSelected: boolean;
}

type AnswerStyle = 'correct' | 'incorrect' | 'selected' | 'default' | 'faded';

interface UseAnswerStyleReturn {
  /** Стиль ответа */
  style: AnswerStyle;
  /** CSS классы */
  className: string;
}

/**
 * Хук для вычисления стилей ответов
 */
export function useAnswerStyle({
  shuffledIndex,
  originalIndex,
  correctAnswers,
  userAnswers,
  isAnswered,
  isSelected,
}: UseAnswerStyleOptions): UseAnswerStyleReturn {
  // Определяем стиль
  const style: AnswerStyle = (() => {
    if (!isAnswered) {
      return isSelected ? 'selected' : 'default';
    }

    // Ответ дан - проверяем правильность
    if (correctAnswers.includes(originalIndex)) {
      return 'correct';
    }

    if (userAnswers.includes(shuffledIndex)) {
      return 'incorrect';
    }

    return 'faded';
  })();

  // CSS классы для каждого стиля
  const classNameMap: Record<AnswerStyle, string> = {
    correct: 'bg-green-100 border-green-500 text-green-900',
    incorrect: 'bg-orange-100 border-orange-500 text-orange-900 border-2',
    selected: 'bg-blue-100 border-blue-500 text-blue-900',
    default: 'bg-white hover:bg-slate-50 border-slate-200',
    faded: 'bg-slate-50 border-slate-200 opacity-50',
  };

  return {
    style,
    className: classNameMap[style],
  };
}

export default useAnswerStyle;

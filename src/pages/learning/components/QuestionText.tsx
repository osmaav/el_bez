/**
 * QuestionText - Текст вопроса
 * 
 * @description Отображение текста вопроса
 * @author el-bez Team
 * @version 1.0.0
 */

export interface QuestionTextProps {
  /** Текст вопроса */
  text: string;
}

export function QuestionText({ text }: QuestionTextProps) {
  return (
    <p className="text-slate-800 mb-2 leading-relaxed">
      {text}
    </p>
  );
}

export default QuestionText;

/**
 * useQuestions - Хук вопросов
 * 
 * @description Хук для использования контекста вопросов
 * @author el-bez Team
 * @version 1.0.0
 */

'use client';

import { useContext } from 'react';
import QuestionsContext from './QuestionsContext';

export function useQuestions() {
  const context = useContext(QuestionsContext);
  if (context === undefined) {
    throw new Error('useQuestions must be used within a QuestionsProvider');
  }
  return context;
}

export default useQuestions;

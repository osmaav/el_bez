/**
 * QuestionsContext - Контекст вопросов
 */

import { createContext } from 'react';

const QuestionsContext = createContext<unknown | undefined>(undefined);

export default QuestionsContext;

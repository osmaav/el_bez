/**
 * Context Barrel Export
 */

// Types
export type {
  NavigationContextType,
  QuestionsContextType,
  FilterContextType,
  TrainerContextType,
  ExamContextType,
  AppContextType,
} from './types';

// Providers
export { NavigationProvider } from './providers/NavigationProvider';
export { QuestionsProvider } from './providers/QuestionsProvider';

// Hooks
export { useNavigation } from './providers/useNavigation';
export { useQuestions } from './providers/useQuestions';

// Main AppContext (legacy - for backward compatibility)
export { AppProvider, AppContext } from './AppContext';

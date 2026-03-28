/**
 * NavigationContext - Контекст навигации
 */

import { createContext } from 'react';

const NavigationContext = createContext<unknown | undefined>(undefined);

export default NavigationContext;

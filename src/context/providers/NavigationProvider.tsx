/**
 * NavigationProvider - Провайдер навигации
 * 
 * @description Управляет текущей страницей и разделом
 * @author el-bez Team
 * @version 1.0.0
 */

'use client';

import React, { createContext, useState, useCallback, useContext } from 'react';
import type { PageType, SectionType } from '@/types';
import { saveUserState } from '@/services/questionService';
import { AuthContext } from '@/context/AuthContext';
import { SECTIONS } from '@/constants/sections';
import type { NavigationContextType } from '../types';

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const STORAGE_KEY_PAGE = 'elbez_current_page';
const STORAGE_KEY_SECTION = 'elbez_current_section';

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  // Получаем пользователя из AuthContext
  const auth = useContext(AuthContext);
  const user = auth?.user || null;

  // Навигация - загружаем сохранённую страницу из localStorage
  const [currentPage, setCurrentPageState] = useState<PageType>(() => {
    if (typeof window !== 'undefined') {
      const savedPage = localStorage.getItem(STORAGE_KEY_PAGE) as PageType | null;
      if (savedPage && ['learning', 'theory', 'examples', 'trainer', 'exam'].includes(savedPage)) {
        return savedPage;
      }
    }
    return 'theory';
  });

  // Раздел (курс) - загружаем сохранённый раздел
  const [currentSection, setCurrentSectionState] = useState<SectionType>(() => {
    if (typeof window !== 'undefined') {
      const savedSection = localStorage.getItem(STORAGE_KEY_SECTION) as SectionType | null;
      const validSections = SECTIONS.map(s => s.id);
      if (savedSection && validSections.includes(savedSection)) {
        return savedSection;
      }
    }
    return '1258-20'; // По умолчанию IV группа
  });

  // Обновляем setCurrentPage для сохранения в localStorage и Firestore
  const setCurrentPage = useCallback((page: PageType) => {
    setCurrentPageState(page);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PAGE, page);
      // Сохраняем в Firestore для авторизованных пользователей
      if (user) {
        saveUserState(user.id, { currentPage: page });
      }
    }
  }, [user]);

  // Обновляем setCurrentSection для сохранения в localStorage и Firestore
  const setCurrentSection = useCallback((section: SectionType) => {
    setCurrentSectionState(section);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SECTION, section);
      // Сохраняем в Firestore для авторизованных пользователей
      if (user) {
        saveUserState(user.id, { currentSection: section });
      }
    }
  }, [user]);

  return (
    <NavigationContext.Provider value={{
      currentPage,
      setCurrentPage,
      currentSection,
      setCurrentSection,
      sections: SECTIONS,
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

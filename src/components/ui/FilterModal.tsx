/**
 * FilterModal — модальное окно для фильтрации вопросов
 *
 * @description Модальное окно для настройки фильтров вопросов
 * @author el-bez UI Team
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Filter, CheckCircle2, XCircle, Eye, EyeOff, X } from 'lucide-react';
import { questionFilterService } from '@/services/questionFilterService';
import type { SectionType, Question } from '@/types';

interface QuestionStats {
  questionId: number;
  ticket: number;
  section: SectionType;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
  isKnown: boolean; // 100% точность
  isWeak: boolean;  // < 70% точность
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filteredIds: number[], settings: { excludeKnown: boolean; excludeWeak: boolean; hiddenQuestionIds: number[] }) => void;
  onReset?: () => void; // Опциональный callback для сброса
  questionStats: QuestionStats[];
  questions?: Question[]; // Текст вопросов для отображения
  hiddenQuestionIds: number[];
  onHiddenChange: (hiddenIds: number[]) => void;
  currentSection: SectionType;
}

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  onReset,
  questionStats,
  questions,
  hiddenQuestionIds,
  onHiddenChange,
  currentSection,
}: FilterModalProps) {
  const [excludeKnown, setExcludeKnown] = useState(false);
  const [excludeWeak, setExcludeWeak] = useState(false);
  const [pendingHiddenIds, setPendingHiddenIds] = useState<number[]>([]);

  // При открытии модального окна блокируем прокрутку страницы
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // При открытии модального окна загружаем текущие настройки
  React.useEffect(() => {
    if (isOpen) {
      const settings = questionFilterService.getSettings(currentSection);
      setExcludeKnown(settings.excludeKnown);
      setExcludeWeak(settings.excludeWeak);
      setPendingHiddenIds(hiddenQuestionIds);
    }
  }, [isOpen, currentSection, hiddenQuestionIds]);

  // Статистика по вопросам
  const stats = useMemo(() => {
    const total = questions?.length || questionStats.length;
    const known = questionStats.filter(q => q.isKnown).length;
    const weak = questionStats.filter(q => q.isWeak).length;
    const normal = total - known - weak;

    return { total, known, weak, normal };
  }, [questionStats, questions]);

  // Применяем фильтры
  const handleApply = () => {
    console.log('🔍 [FilterModal] handleApply вызван');
    try {
      const allQuestions = questions || [];
      const filteredIds = allQuestions
        .filter(q => {
          const qStats = questionStats.find(s => s.questionId === q.id);
          if (excludeKnown && qStats?.isKnown) return false;
          if (excludeWeak && qStats?.isWeak) return false;
          if (pendingHiddenIds.includes(q.id)) return false;
          return true;
        })
        .map(q => q.id);

      // Сохраняем ВСЕ настройки в сервис (включая hiddenQuestionIds)
      const settings = questionFilterService.getSettings(currentSection);
      settings.excludeKnown = excludeKnown;
      settings.excludeWeak = excludeWeak;
      settings.hiddenQuestionIds = pendingHiddenIds;
      questionFilterService.saveSettings(settings);

      // Применяем скрытые вопросы и фильтры (передаём hiddenQuestionIds в onApply)
      onHiddenChange(pendingHiddenIds);
      onApply(filteredIds, { excludeKnown, excludeWeak, hiddenQuestionIds: pendingHiddenIds });
      console.log('🔍 [FilterModal] Вызов onClose()');
      onClose();
    } catch (error) {
      console.error('❌ [FilterModal] Ошибка в handleApply:', error);
    }
  };

  // Сброс фильтров
  const handleReset = () => {
    console.log('🔄 [FilterModal] handleReset вызван');
    try {
      setExcludeKnown(false);
      setExcludeWeak(false);
      setPendingHiddenIds([]);
      questionFilterService.resetSettings(currentSection);

      // Если есть onReset, используем его для полного сброса
      if (onReset) {
        console.log('🔄 [FilterModal] Вызов onReset()');
        onReset();
      } else {
        // Fallback: старый способ
        const allQuestionIds = questions?.map(q => q.id) || questionStats.map(q => q.questionId);
        onHiddenChange([]);
        onApply(allQuestionIds, { excludeKnown: false, excludeWeak: false, hiddenQuestionIds: [] });
      }

      console.log('🔄 [FilterModal] Вызов onClose()');
      onClose();
    } catch (error) {
      console.error('❌ [FilterModal] Ошибка в handleReset:', error);
    }
  };

  // Скрыть/показать вопрос (только в pending состоянии)
  const toggleHideQuestion = (questionId: number) => {
    const newPending = pendingHiddenIds.includes(questionId)
      ? pendingHiddenIds.filter(id => id !== questionId)
      : [...pendingHiddenIds, questionId];

    setPendingHiddenIds(newPending);
  };

  // Предварительный просмотр количества вопросов
  const previewCount = useMemo(() => {
    const allQuestions = questions || [];
    return allQuestions.filter(q => {
      const qStats = questionStats.find(s => s.questionId === q.id);
      if (excludeKnown && qStats?.isKnown) return false;
      if (excludeWeak && qStats?.isWeak) return false;
      if (pendingHiddenIds.includes(q.id)) return false;
      return true;
    }).length;
  }, [excludeKnown, excludeWeak, pendingHiddenIds, questionStats, questions]);

  // Фильтрованный список вопросов для отображения (исключая известные/слабые)
  const filteredQuestionsList = useMemo(() => {
    if (!questions) return [];
    return questions.filter(q => {
      const qStats = questionStats.find(s => s.questionId === q.id);
      // Если включено исключение известных и вопрос известный — скрываем
      if (excludeKnown && qStats?.isKnown) return false;
      // Если включено исключение слабых и вопрос слабый — скрываем
      if (excludeWeak && qStats?.isWeak) return false;
      return true;
    });
  }, [questions, questionStats, excludeKnown, excludeWeak]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Затемнение фона - без закрытия по клику */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Модальное окно - центрирование по viewport */}
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl mx-auto my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="shadow-2xl border-slate-200">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">Фильтр вопросов</CardTitle>
                      <CardDescription>
                        Настройте параметры отображения вопросов
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                {/* Переключатели фильтров */}
                <div className="grid gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="exclude-known" className="flex flex-col space-y-1 cursor-pointer">
                      <span className="text-sm font-medium">Исключить известные</span>
                      <span className="text-xs text-muted-foreground">
                        Вопросы со 100% точностью ({stats.known} шт)
                      </span>
                    </Label>
                    <Switch
                      id="exclude-known"
                      checked={excludeKnown}
                      onCheckedChange={(checked) => {
                        setExcludeKnown(checked);
                      }}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="exclude-weak" className="flex flex-col space-y-1 cursor-pointer">
                      <span className="text-sm font-medium">Исключить слабые</span>
                      <span className="text-xs text-muted-foreground">
                        Вопросы с точностью &lt;70% ({stats.weak} шт)
                      </span>
                    </Label>
                    <Switch
                      id="exclude-weak"
                      checked={excludeWeak}
                      onCheckedChange={(checked) => {
                        setExcludeWeak(checked);
                      }}
                    />
                  </div>
                </div>

                {/* Статистика и предпросмотр */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        Известные
                      </span>
                    </div>
                    <div className="text-lg font-bold text-emerald-600">{stats.known}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span className="text-xs font-medium text-rose-700 dark:text-rose-400">
                        Слабые
                      </span>
                    </div>
                    <div className="text-lg font-bold text-rose-600">{stats.weak}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Filter className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                        В работе
                      </span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">{previewCount}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/20 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Filter className="w-3 h-3 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                        Всего
                      </span>
                    </div>
                    <div className="text-lg font-bold text-slate-600">{stats.total}</div>
                  </div>
                </div>

                {/* Предупреждение о скрытых вопросах */}
                {pendingHiddenIds.length > 0 && (
                  <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
                    <AlertDescription className="text-amber-800 dark:text-amber-300">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          Скрыто вопросов: {pendingHiddenIds.length}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPendingHiddenIds([])}
                          className="h-6 text-xs"
                        >
                          Показать все
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Список вопросов для ручного скрытия */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Ручное скрытие вопросов:</Label>
                  <div className="grid gap-1 max-h-60 overflow-y-auto p-2 rounded-lg bg-slate-50 dark:bg-slate-950/20">
                    {filteredQuestionsList?.map((q) => {
                      const qStats = questionStats.find(s => s.questionId === q.id);
                      const accuracy = qStats?.accuracy || 0;
                      const isKnown = qStats?.isKnown || false;
                      const isWeak = qStats?.isWeak || false;
                      const ticket = qStats?.ticket || q.ticket;
                      
                      const questionText = q.text || q.question || `Вопрос ${q.id}`;
                      const truncatedText = questionText.length > 80
                        ? questionText.substring(0, 80) + '...'
                        : questionText;

                      return (
                        <div
                          key={q.id}
                          className="flex items-start gap-2 p-2 rounded-md bg-white dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-800"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                Билет {ticket}, Вопрос {q.id}
                              </span>
                              <Badge
                                variant={isKnown ? 'default' : isWeak ? 'destructive' : 'secondary'}
                                className="h-4 text-[9px]"
                              >
                                {accuracy}%
                              </Badge>
                              {pendingHiddenIds.includes(q.id) && (
                                <Badge variant="outline" className="h-4 text-[9px] border-amber-500 text-amber-600">
                                  Скрыт
                                </Badge>
                              )}
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-tight">
                              {truncatedText}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleHideQuestion(q.id)}
                            className="h-6 w-6 p-0 flex-shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            {pendingHiddenIds.includes(q.id) ? (
                              <EyeOff className="w-3 h-3 text-amber-600" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    Сбросить фильтры
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleApply}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Применить ({previewCount} вопр.)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default FilterModal;

/**
 * QuestionFilter — Фильтр вопросов для обучения и тренажёра
 * 
 * @description Позволяет исключить известные вопросы (100% точность) из списка
 * @author el-bez UI Team
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Filter, CheckCircle2, XCircle, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import type { SectionType } from '@/types';

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

interface QuestionFilterProps {
  questionStats: QuestionStats[];
  onFilterChange: (filteredQuestionIds: number[]) => void;
  hiddenQuestionIds: number[];
  onHiddenChange: (hiddenIds: number[]) => void;
}

export const QuestionFilter: React.FC<QuestionFilterProps> = ({
  questionStats,
  onFilterChange,
  hiddenQuestionIds,
  onHiddenChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [excludeKnown, setExcludeKnown] = useState(false);
  const [excludeWeak, setExcludeWeak] = useState(false);

  // Статистика по вопросам
  const stats = useMemo(() => {
    const total = questionStats.length;
    const known = questionStats.filter(q => q.isKnown).length;
    const weak = questionStats.filter(q => q.isWeak).length;
    const normal = total - known - weak;
    
    return { total, known, weak, normal };
  }, [questionStats]);

  // Применяем фильтры
  const applyFilters = () => {
    const filteredIds = questionStats
      .filter(q => {
        if (excludeKnown && q.isKnown) return false;
        if (excludeWeak && q.isWeak) return false;
        if (hiddenQuestionIds.includes(q.questionId)) return false;
        return true;
      })
      .map(q => q.questionId);
    
    onFilterChange(filteredIds);
  };

  // Сброс фильтров
  const handleReset = () => {
    setExcludeKnown(false);
    setExcludeWeak(false);
    onFilterChange(questionStats.map(q => q.questionId));
  };

  // Скрыть/показать вопрос
  const toggleHideQuestion = (questionId: number) => {
    const newHidden = hiddenQuestionIds.includes(questionId)
      ? hiddenQuestionIds.filter(id => id !== questionId)
      : [...hiddenQuestionIds, questionId];
    
    onHiddenChange(newHidden);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-base">Фильтр вопросов</CardTitle>
              <CardDescription>
                Исключите известные вопросы для эффективного обучения
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Переключатели фильтров */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="exclude-known" className="flex flex-col space-y-1">
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
                  setTimeout(applyFilters, 0);
                }}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="exclude-weak" className="flex flex-col space-y-1">
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
                  setTimeout(applyFilters, 0);
                }}
              />
            </div>
          </div>
          
          {/* Статистика */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Известные
                </span>
              </div>
              <div className="text-lg font-bold text-emerald-600">{stats.known}</div>
            </div>
            
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="w-3 h-3 text-rose-600" />
                <span className="text-xs font-medium text-rose-700 dark:text-rose-400">
                  Слабые
                </span>
              </div>
              <div className="text-lg font-bold text-rose-600">{stats.weak}</div>
            </div>
            
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Filter className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                  В работе
                </span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {excludeKnown || excludeWeak 
                  ? questionStats.filter(q => {
                      if (excludeKnown && q.isKnown) return false;
                      if (excludeWeak && q.isWeak) return false;
                      return true;
                    }).length
                  : stats.total
                }
              </div>
            </div>
          </div>
          
          {/* Список скрытых вопросов */}
          {hiddenQuestionIds.length > 0 && (
            <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
              <AlertDescription className="text-amber-800 dark:text-amber-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Скрыто вопросов: {hiddenQuestionIds.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onHiddenChange([])}
                    className="h-6 text-xs"
                  >
                    Показать все
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Кнопки действий */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1"
            >
              Сбросить фильтры
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={applyFilters}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Применить
            </Button>
          </div>
          
          {/* Детальный список вопросов для скрытия */}
          {questionStats.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <Label className="text-xs font-medium">Ручное скрытие вопросов:</Label>
              <div className="grid gap-1">
                {questionStats.slice(0, 20).map((q) => (
                  <div
                    key={q.questionId}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Билет {q.ticket}</span>
                      <Badge 
                        variant={q.isKnown ? 'default' : q.isWeak ? 'destructive' : 'secondary'}
                        className="h-4 text-[9px]"
                      >
                        {q.accuracy}%
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleHideQuestion(q.questionId)}
                      className="h-6 w-6 p-0"
                    >
                      {hiddenQuestionIds.includes(q.questionId) ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                ))}
                {questionStats.length > 20 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    + ещё {questionStats.length - 20} вопросов
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default QuestionFilter;

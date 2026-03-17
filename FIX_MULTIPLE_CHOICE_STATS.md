# Исправление статистики для вопросов с множественным выбором

## 📋 Обзор проблемы

При прохождении тестов в режиме **Обучение** вопросы с несколькими правильными ответами не записывались в SessionTracker корректно. Это приводило к потере данных в статистике.

### Симптомы:
- При ответе на 10 вопросов (8 одиночных + 2 с множественным выбором) в статистику записывалось только **9 вопросов**
- `totalQuestionsAnswered: 9` вместо ожидаемых `10`
- Вопросы 5 и 10 (с множественным выбором) не записывались если выбран не полный ответ

---

## 🔍 Причина проблемы

### 1. Логика записи ответов

**Было:**
```typescript
// LearningSection.tsx
if (expectedCount === 1 || isSelectedAll) {
  sessionTrackerRef.current.recordAnswer(...);
}
```

**Проблема:** Для вопросов с множественным выбором (`expectedCount > 1`) ответ записывался **только** когда выбраны ВСЕ ответы (`isSelectedAll === true`).

Если пользователь выбрал 1 из 2 ответов:
- `expectedCount: 2`
- `isSelectedAll: false` (выбран только 1)
- `shouldRecord: false` ← **ответ НЕ записывается!**

### 2. Завершение сессии

**Было:**
```typescript
if (allAnswered) {
  sessionTrackerRef.current?.finish();
  sessionTrackerRef.current = null;
}
```

**Проблема:** Сессия завершалась сразу, не записывая незавершённые ответы на вопросы с множественным выбором.

---

## ✅ Решение

### Изменение 1: Запись незаписанных ответов перед завершением сессии

**Файл:** `src/sections/learning/LearningSection.tsx`

```typescript
if (allAnswered && sessionTrackerRef.current) {
  console.log('✅ [LearningSection] Все вопросы отвечены, запись незаписанных ответов...');
  
  // Сначала записываем все незаписанные ответы (вопросы с множественным выбором)
  newUserAnswers.forEach((userAnswer, idx) => {
    if (userAnswer === null) return;
    
    const q = quizState.currentQuestions[idx];
    if (!q) return;
    
    const correctAns = Array.isArray(q.correct) ? q.correct : [q.correct];
    const expCount = correctAns.length;
    const userAnsArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    
    // Если вопрос с множественным выбором и не полностью отвечен - записываем что есть
    if (expCount > 1 && userAnsArray.length < expCount && userAnsArray.length > 0) {
      console.log(`📝 [LearningSection] Запись неполного ответа на вопрос ${q.id}:`, {
        userAnswer,
        correctAns,
      });
      
      const shuffledIdx = userAnsArray.map(i => quizState.shuffledAnswers[idx][i]);
      sessionTrackerRef.current?.recordAnswer(q.id, q.ticket, shuffledIdx, correctAns, 0);
    }
  });
  
  // Теперь завершаем сессию
  console.log('✅ [LearningSection] Завершение сессии');
  sessionTrackerRef.current.finish();
  sessionTrackerRef.current = null;
}
```

**Результат:** Перед завершением сессии все незаписанные ответы (вопросы с множественным выбором где выбран не полный ответ) записываются в SessionTracker.

---

### Изменение 2: Обновление типов для поддержки множественных ответов

**Файл:** `src/types/index.ts`

```typescript
export interface QuestionAttempt {
  questionId: number;
  ticket: number;
  section: SectionType;
  isCorrect: boolean;
  userAnswer: number | number[];  // ← Поддержка массива
  correctAnswer: number | number[]; // ← Поддержка массива
  timestamp: number;
  timeSpent: number;
}
```

**Файл:** `src/services/statisticsService.ts`

```typescript
recordAnswer(
  questionId: number,
  ticket: number,
  userAnswer: number | number[],    // ← Поддержка массива
  correctAnswer: number | number[], // ← Поддержка массива
  timeSpent: number
): void {
  if (!this.session) return;

  // Нормализуем ответы к массивам для сравнения
  const userAnswersArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
  const correctAnswersArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

  // Сравниваем массивы (порядок не важен)
  const sortedUser = [...userAnswersArray].sort((a, b) => a - b);
  const sortedCorrect = [...correctAnswersArray].sort((a, b) => a - b);
  const isCorrect = sortedUser.length === sortedCorrect.length &&
                    sortedUser.every((val, idx) => val === sortedCorrect[idx]);

  const attempt: QuestionAttempt = {
    questionId,
    ticket,
    section: this.section,
    isCorrect,
    userAnswer,
    correctAnswer,
    timestamp: Date.now(),
    timeSpent,
  };

  this.questions.push(attempt);
  this.session.questions = this.questions;
  this.session.totalQuestions++;

  if (isCorrect) {
    this.session.correctAnswers++;
  } else {
    this.session.incorrectAnswers++;
  }

  this.session.accuracy = Math.round(
    (this.session.correctAnswers / this.session.totalQuestions) * 100
  );
}
```

**Результат:** SessionTracker теперь корректно обрабатывает ответы с несколькими вариантами.

---

### Изменение 3: Обновление статистики в useLearningProgress

**Файл:** `src/hooks/useLearningProgress.ts`

```typescript
useEffect(() => {
  if (quizState.currentQuestions.length > 0) {
    let correct = 0;
    let answered = 0;

    quizState.userAnswers.forEach((userAnswer, qIdx) => {
      if (userAnswer === null) return;
      answered++;

      const question = quizState.currentQuestions[qIdx];
      const correctAnswers = Array.isArray(question.correct) ? question.correct : [question.correct];
      const shuffled = quizState.shuffledAnswers[qIdx];

      // Нормализуем ответ пользователя к массиву ОРИГИНАЛЬНЫХ индексов ответов
      let userOriginalIndices: number[];
      if (Array.isArray(userAnswer)) {
        userOriginalIndices = userAnswer.map(idx => shuffled[idx]);
      } else {
        userOriginalIndices = [shuffled[userAnswer]];
      }

      // Проверяем правильность через checkAnswer
      if (checkAnswer(userOriginalIndices, correctAnswers)) {
        correct++;
      }
    });

    const incorrect = answered - correct;
    const remaining = quizState.currentQuestions.length - answered;
    setStats({ correct, incorrect, remaining });
  }
}, [
  quizState.userAnswers,
  quizState.shuffledAnswers,
  quizState.currentQuestions,
  checkAnswer
]);
```

**Результат:** Статистика на странице правильно считается для вопросов с множественным выбором.

---

## 🧪 Тесты

### Созданные тесты:

1. **`src/utils/__tests__/multiple-choice-regression.test.ts`** (22 теста)
   - Проверка `checkAnswer` для одиночного и множественного выбора
   - Проверка `isMultipleChoice`, `getCorrectAnswersCount`
   - Интеграционные сценарии

2. **`src/hooks/__tests__/useLearningProgress.stats.test.ts`** (9 тестов)
   - Проверка подсчёта статистики
   - Сценарий "8 верных + 2 ошибки"
   - Проверка формул и инвариантов

3. **`src/sections/learning/components/__tests__/LearningQuestionsList.isAnswered.test.ts`** (15 тестов)
   - Логика `isAnswered` для одиночного и множественного выбора
   - SessionTracker recordAnswer

4. **`src/sections/learning/hooks/__tests__/useQuizState.isComplete.integration.test.ts`** (13 тестов)
   - isComplete только после всех ответов
   - Проверка экспорта и статистики

### Результаты тестов:
```
✓ Test Files: 57 passed
✓ Tests: 686 passed
✓ TypeScript: No errors
```

---

## 🛠 Автоматизация тестирования

### Скрипт для автоматического тестирования

**Файл:** `scripts/test-stats-improved.js`

**Возможности:**
- Автоматический клик на все ответы (`autoTest()`)
- Автоматический клик на случайные ответы (`autoTestRandom()`)
- Проверка состояния (`checkState()`)
- Проверка статистики на странице (`checkPageStats()`)
- Проверка кнопок ответов (`checkAnswerButtons()`)

**Особенности:**
- Фильтрует кнопки по тексту "Вариант ответа" (игнорирует кнопку "Войти")
- Автоматически определяет вопросы с множественным выбором (вопросы 5 и 10 в моках)
- Для вопросов с множественным выбором кликает на 2 ответа
- Пауза между кликами для имитации действий пользователя

**Использование:**
```bash
# Скопировать скрипт в буфер
cat scripts/test-stats-improved.js | pbcopy

# Вставить в консоль браузера (F12) и выполнить:
autoTest()       # Кликнуть на первые ответы
autoTestRandom() # Кликнуть случайно
checkState()     # Проверить состояние
```

---

## 📊 Результаты

### До исправления:
```
📊 [StatisticsService] Сессия записана:
  totalQuestionsAnswered: 9  ❌
  correctAnswers: 0
  incorrectAnswers: 8
```

### После исправления:
```
📊 [StatisticsService] Сессия записана:
  totalQuestionsAnswered: 10 ✅
  correctAnswers: X
  incorrectAnswers: Y
```

---

## 📁 Изменённые файлы

### Основные изменения:
1. `src/sections/learning/LearningSection.tsx` - Запись незаписанных ответов
2. `src/services/statisticsService.ts` - Поддержка множественных ответов
3. `src/types/index.ts` - Обновление типов
4. `src/hooks/useLearningProgress.ts` - Исправление подсчёта статистики

### Тесты:
5. `src/utils/__tests__/multiple-choice-regression.test.ts`
6. `src/hooks/__tests__/useLearningProgress.stats.test.ts`
7. `src/sections/learning/components/__tests__/LearningQuestionsList.isAnswered.test.ts`
8. `src/sections/learning/hooks/__tests__/useQuizState.isComplete.integration.test.ts`

### Утилиты:
9. `scripts/test-stats-improved.js` - Скрипт для автоматического тестирования
10. `scripts/README.md` - Документация скриптов

---

## ✅ Чек-лист проверки

- [x] Все 10 вопросов записываются в SessionTracker
- [x] Вопросы с множественным выбором обрабатываются корректно
- [x] Статистика на странице показывает правильные значения
- [x] Все тесты проходят (686 тестов)
- [x] TypeScript компилируется без ошибок
- [x] Скрипт автоматического тестирования работает
- [x] Кнопка "Войти" не нажимается автоматически
- [x] Вопросы 5 и 10 получают по 2 ответа

---

## 🔗 Связанные задачи

- Поддержка множественных правильных ответов в вопросах
- Исправление статистики для вопросов с несколькими вариантами
- Автоматизация тестирования UI

---

*Дата: 17 марта 2026 г.*
*Версия: 2026.03.17*

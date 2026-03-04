# 🎯 UI Patterns — Реализация модальных окон и Toast-уведомлений

## 📦 Реализованные функции

### 1. **Глобальный ToastContext**

**Файл:** `src/context/ToastContext.tsx`

Централизованное управление toast-уведомлениями через React Context.

**Функции:**
- `success(title, description)` — успешное уведомление
- `error(title, description)` — уведомление об ошибке
- `warning(title, description)` — предупреждение
- `info(title, description)` — информация
- `loading(title, description)` — загрузка
- `updateToast(id, options)` — обновление существующего уведомления

**Использование:**
```typescript
import { useToast } from '@/context/ToastContext';

const { success, error, loading } = useToast();

// Показ уведомления
success('Готово!', 'Данные сохранены');

// Обновление уведомления
const loadingId = loading('Загрузка', 'Пожалуйста, подождите...');
updateToast(loadingId, { type: 'success', title: 'Готово!' });
```

---

### 2. **LearningSection — Обучение**

**Файл:** `src/sections/LearningSection.tsx`

#### **ConfirmModal.Warning при сбросе:**

```typescript
<ConfirmModal
  isOpen={showResetConfirm}
  onClose={() => setShowResetConfirm(false)}
  onConfirm={confirmReset}
  title="Сброс прогресса"
  description="Вы уверены, что хотите сбросить весь прогресс обучения?"
  type="warning"
  confirmLabel="Сбросить"
  cancelLabel="Отмена"
/>
```

**Сценарий:**
1. Пользователь нажимает "Сброс"
2. Появляется ConfirmModal с предупреждением
3. При подтверждении — прогресс сбрасывается
4. Показывается Toast: "Прогресс сброшен"

#### **LoadingModal при смене раздела:**

```typescript
<LoadingModal
  isOpen={loadingModal.isOpen}
  title="Загрузка раздела"
  description={`Переход к разделу ${currentSection}...`}
  type="default"
  status={loadingModal.status}
  progress={loadingModal.progress}
/>
```

**Сценарий:**
1. Пользователь меняет раздел (ЭБ 1256.19 ↔ ЭБ 1258.20)
2. Показывается LoadingModal с прогрессом
3. Параллельно показывается Toast
4. Через 1 секунду — успех и закрытие

---

### 3. **TrainerSection — Тренажёр**

**Файл:** `src/sections/TrainerSection.tsx`

#### **LoadingModal при запуске:**

```typescript
const handleStartTrainer = (questionCount: number) => {
  setLoadingModal({
    isOpen: true,
    status: 'loading',
    title: 'Запуск тренажёра',
    description: `Загрузка ${questionCount} вопросов...`
  });
  
  const loadingId = loading('Запуск тренажёра');
  
  setTimeout(() => {
    startTrainer(questionCount);
    updateToast(loadingId, { type: 'success', title: 'Тренажёр запущен' });
  }, 800);
};
```

**Сценарий:**
1. Пользователь выбирает "50 вопросов" или "20 вопросов"
2. Показывается LoadingModal с прогрессом
3. Запускается тренажёр
4. Показывается Toast об успехе

#### **ConfirmModal.Warning при сбросе:**

```typescript
<ConfirmModal
  isOpen={showResetConfirm}
  onConfirm={confirmResetTrainer}
  title="Сброс тренажёра"
  description="Вы уверены, что хотите сбросить текущую тренировку?"
  type="warning"
/>
```

**Сценарий:**
1. Пользователь нажимает "Новая тренировка"
2. Появляется ConfirmModal
3. При подтверждении — сброс и Toast

---

### 4. **ExamSection — Экзамен**

**Файл:** `src/sections/ExamSection.tsx`

#### **LoadingModal при выборе билета:**

```typescript
const handleStartExam = (ticketId: number) => {
  setLoadingModal({
    isOpen: true,
    title: 'Запуск экзамена',
    description: `Загрузка билета ${ticketId}...`
  });
  
  const loadingId = loading('Запуск экзамена');
  
  setTimeout(() => {
    startExam(ticketId);
    updateToast(loadingId, { type: 'success', title: 'Экзамен начат' });
  }, 800);
};
```

**Сценарий:**
1. Пользователь выбирает билет (1-25 или 1-31)
2. Показывается LoadingModal
3. Билет загружается
4. Показывается Toast

#### **ConfirmModal.Warning при сбросе:**

```typescript
<ConfirmModal
  isOpen={showResetConfirm}
  onConfirm={confirmResetExam}
  title="Сброс экзамена"
  description="Вы уверены, что хотите сбросить текущий экзамен?"
  type="warning"
/>
```

**Сценарий:**
1. Пользователь нажимает "Выбрать другой билет"
2. Появляется ConfirmModal
3. При подтверждении — сброс и Toast

---

## 🎨 Визуальные стили

### ConfirmModal (Warning)

```
┌─────────────────────────────────────┐
│  [⚠️] Сброс прогресса          [X] │
├─────────────────────────────────────┤
│                                     │
│  Вы уверены, что хотите сбросить    │
│  весь прогресс обучения? Это        │
│  действие нельзя отменить.          │
│                                     │
├─────────────────────────────────────┤
│              [Отмена] [Сбросить]    │
└─────────────────────────────────────┘
```

**Стили:**
- Иконка: `AlertTriangle` на янтарном фоне
- Кнопка подтверждения: янтарная (`bg-amber-500`)
- Тип: `warning`

---

### LoadingModal

```
┌─────────────────────────────────────┐
│  [⏳] Загрузка раздела         [X]  │
├─────────────────────────────────────┤
│                                     │
│  Переход к разделу ЭБ 1258.20...    │
│                                     │
│  [████████████░░░░░░] 75%           │
│                                     │
└─────────────────────────────────────┘
```

**Стили:**
- Иконка: `Loader2` (спиннер)
- Прогресс-бар с анимацией
- Статусы: `loading` → `success`

---

### Toast Notifications

**Error:**
```
┌────────────────────────────────────┐
│ ❌ Ошибка входа                    │
│ Пользователь не найден             │
│ [────────────────] 5s              │
└────────────────────────────────────┘
```

**Success:**
```
┌────────────────────────────────────┐
│ ✅ Прогресс сброшен                │
│ Все ответы очищены                 │
│ [────────────────] 5s              │
└────────────────────────────────────┘
```

**Loading:**
```
┌────────────────────────────────────┐
│ ⏳ Запуск тренажёра                │
│ Пожалуйста, подождите...           │
│ [████████░░░░░░░░] 60%             │
└────────────────────────────────────┘
```

---

## 📊 Сценарии использования

### Сценарий 1: Смена раздела в Обучении

```
1. Пользователь в разделе "ЭБ 1256.19"
2. Переключает на "ЭБ 1258.20"
   ↓
3. [LoadingModal] "Загрузка раздела"
   [Toast] "Загрузка раздела..."
   ↓
4. Прогресс: 0% → 20% → 40% → 60% → 80% → 100%
   ↓
5. [LoadingModal] статус: success
   [Toast] "Раздел загружен" ✓
   ↓
6. LoadingModal закрывается
7. Пользователь видит новый раздел
```

---

### Сценарий 2: Сброс прогресса

```
1. Пользователь нажимает "Сброс"
   ↓
2. [ConfirmModal] "Сброс прогресса"
   "Вы уверены?"
   ↓
3. Пользователь нажимает "Сбросить"
   ↓
4. Прогресс очищается
   ↓
5. [Toast] "Прогресс сброшен" ✓
   "Все ответы очищены"
```

---

### Сценарий 3: Запуск тренажёра

```
1. Пользователь выбирает "50 вопросов"
   ↓
2. [LoadingModal] "Запуск тренажёра"
   [Toast] "Запуск тренажёра..."
   ↓
3. Прогресс: 0% → 25% → 50% → 75% → 90%
   ↓
4. startTrainer(50) выполняется
   ↓
5. [LoadingModal] статус: success
   [Toast] "Тренажёр запущен" ✓
   ↓
6. LoadingModal закрывается
7. Показывается первый вопрос
```

---

### Сценарий 4: Ошибка входа

```
1. Пользователь вводит неверный пароль
   ↓
2. Firebase возвращает ошибку
   ↓
3. [Toast] "Ошибка входа" ❌
   "Неверный пароль"
   ↓
4. Toast исчезает через 5 секунд
```

---

## 🔧 Технические детали

### Структура файлов

```
src/
├── context/
│   └── ToastContext.tsx       # Глобальный контекст Toast
├── components/ui/
│   ├── toast-message.tsx      # Компонент Toast
│   ├── confirm-modal.tsx      # ConfirmModal
│   └── loading-modal.tsx      # LoadingModal
├── sections/
│   ├── LearningSection.tsx    # + ConfirmModal + LoadingModal
│   ├── TrainerSection.tsx     # + ConfirmModal + LoadingModal
│   └── ExamSection.tsx        # + ConfirmModal + LoadingModal
└── App.tsx                    # ToastProvider + ToastWrapper
```

### Импорты

```typescript
// Context
import { useToast } from '@/context/ToastContext';

// Компоненты
import { LoadingModal } from '@/components/ui/loading-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { ToastContainer } from '@/components/ui/toast-message';
```

### Подключение в App.tsx

```typescript
import { ToastProvider, useToast } from '@/context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>...</Routes>
          <ToastWrapper />
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  );
}

function ToastWrapper() {
  const { toasts, removeToast } = useToast();
  return (
    <ToastContainer
      toasts={toasts}
      onDismiss={removeToast}
      position="top-right"
    />
  );
}
```

---

## ✅ Чек-лист реализации

- [x] Глобальный ToastContext
- [x] LearningSection: ConfirmModal при сбросе
- [x] LearningSection: LoadingModal при смене раздела
- [x] LearningSection: Toast при сбросе
- [x] TrainerSection: LoadingModal при запуске
- [x] TrainerSection: ConfirmModal при сбросе
- [x] TrainerSection: Toast при запуске и сбросе
- [x] ExamSection: LoadingModal при выборе билета
- [x] ExamSection: ConfirmModal при сбросе
- [x] ExamSection: Toast при запуске и сбросе
- [x] Все процессы дублируются Toast-уведомлениями

---

**Версия:** 1.0.0  
**Дата:** Март 2026  
**Статус:** ✅ Готово

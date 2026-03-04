# 🎨 UI Patterns — Библиотека современных компонентов

Готовая коллекция современных UI-паттернов для приложения **el-bez**.

---

## ✅ Статус сборки

**Все компоненты успешно компилируются без ошибок!**

```bash
npm run build
✓ built in 4.28s
```

---

## 📦 Созданные компоненты

### 1. **ToastMessage** — Система уведомлений
**Файл:** `src/components/ui/toast-message.tsx`  
**Хук:** `src/hooks/use-toast.ts`

Красивые toast-уведомления с анимациями, прогрессом и действиями.

**Типы:**
- ✅ `success` — зелёный
- ❌ `error` — красный  
- ⚠️ `warning` — янтарный
- ℹ️ `info` — синий
- ⏳ `loading` — серый

**Пример:**
```tsx
const { success, error } = useToast();

<Button onClick={() => success('Готово!', 'Данные сохранены')} />
```

---

### 2. **ConfirmModal** — Подтверждение действий
**Файл:** `src/components/ui/confirm-modal.tsx`

Модальное окно для подтверждения с 4 типами стилизации.

**Типы:** `default` | `danger` | `warning` | `info`

**Пример:**
```tsx
<ConfirmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Удаление"
  description="Вы уверены?"
  type="danger"
/>
```

---

### 3. **SuccessModal** — Успех
**Файл:** `src/components/ui/success-modal.tsx`

Праздничное модальное окно с градиентом и конфетти.

**Иконки:** `check` | `sparkles` | `trophy` | `star` | `award`

**Пример:**
```tsx
<SuccessModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Поздравляем!"
  icon="trophy"
  showConfetti={true}
/>
```

---

### 4. **LoadingModal** — Загрузка
**Файл:** `src/components/ui/loading-modal.tsx`

Отслеживание прогресса с анимацией и статусами.

**Типы:** `default` | `upload` | `download` | `save` | `sync`  
**Статусы:** `loading` | `success` | `error`

**Пример:**
```tsx
<LoadingModal
  isOpen={loading}
  onClose={() => setLoading(false)}
  title="Сохранение"
  type="save"
  progress={75}
/>
```

---

### 5. **BottomSheet** — Нижняя панель
**Файл:** `src/components/ui/bottom-sheet.tsx`

Выезжающая панель для мобильных с поддержкой свайпов.

**Компоненты:**
- `BottomSheet` — основная панель
- `BottomSheetItem` — элемент списка
- `BottomSheetHeader` — заголовок с иконкой

**Пример:**
```tsx
<BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <BottomSheetItem
    icon={<Edit3 />}
    label="Редактировать"
    onClick={handleEdit}
  />
</BottomSheet>
```

---

### 6. **RichTooltip** — Подсказки
**Файл:** `src/components/ui/rich-tooltip.tsx`

Богатые подсказки с контентом, иконками и действиями.

**Типы:** `default` | `info` | `warning` | `error` | `success` | `tip`

**Пример:**
```tsx
<RichTooltip
  type="tip"
  title="💡 Совет"
  content="Используйте Ctrl+S"
  action={{ label: 'OK', onClick: () => {} }}
>
  <Button>Помощь</Button>
</RichTooltip>
```

---

### 7. **PageTransition** — Анимация страниц
**Файл:** `src/components/ui/page-transition.tsx`

Плавное появление контента при навигации.

**Анимации:** `fade` | `slide` | `zoom` | `fade-up`

**Пример:**
```tsx
<PageTransition animation="fade-up">
  <YourComponent />
</PageTransition>
```

---

### 8. **AnimatedModal** — Универсальное модальное окно
**Файл:** `src/components/ui/animated-modal.tsx`

Базовое модальное окно с настраиваемыми анимациями.

**Анимации:** `fade` | `slide-up` | `slide-down` | `scale` | `blur`

---

## 🎯 Демо-страница

**Файл:** `src/components/ui-showcase/UIPatternsShowcase.tsx`

Интерактивная демонстрация всех компонентов с живыми примерами.

Для просмотра добавьте роут:
```tsx
<Route path="/ui-showcase" element={<UIPatternsShowcase />} />
```

---

## 📁 Структура файлов

```
src/
├── components/
│   ├── ui/
│   │   ├── toast-message.tsx       ✅
│   │   ├── confirm-modal.tsx       ✅
│   │   ├── success-modal.tsx       ✅
│   │   ├── loading-modal.tsx       ✅
│   │   ├── bottom-sheet.tsx        ✅
│   │   ├── rich-tooltip.tsx        ✅
│   │   ├── page-transition.tsx     ✅
│   │   └── animated-modal.tsx      ✅
│   └── ui-showcase/
│       └── UIPatternsShowcase.tsx  ✅
└── hooks/
    └── use-toast.ts                ✅
```

---

## 🚀 Быстрый старт

### 1. Настройка хука

```tsx
// В корневом компоненте
import { useToast, ToastContainer } from '@/hooks/use-toast';

function App() {
  const { toasts, removeToast } = useToast();
  
  return (
    <>
      {/* Ваш контент */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
}
```

### 2. Использование в компонентах

```tsx
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { success, error, loading } = useToast();
  
  const handleSubmit = async () => {
    const id = loading('Отправка', 'Пожалуйста, подождите...');
    try {
      await api.submit();
      success('Успешно!', 'Данные отправлены');
    } catch {
      error('Ошибка', 'Не удалось отправить');
    }
  };
  
  return <Button onClick={handleSubmit}>Отправить</Button>;
}
```

---

## 🎨 Дизайнерские принципы

### Цветовая палитра

| Тип | Цвет | Градиент |
|-----|------|----------|
| Success | Emerald | `from-emerald-500 to-teal-600` |
| Error | Red | `from-red-500 to-rose-600` |
| Warning | Amber | `from-amber-500 to-orange-500` |
| Info | Blue | `from-blue-500 to-indigo-600` |
| Loading | Slate | `from-slate-500 to-gray-600` |

### Анимации

- **Появление:** Spring animation (stiffness: 500, damping: 30)
- **Исчезновение:** Fade out (duration: 0.2s)
- **Easing:** `easeOut` для плавности

### Размеры и отступы

- **Модальные окна:** `max-w-md` (448px)
- **Toast:** `max-w-[400px]`
- **Скругления:** `rounded-2xl` / `rounded-3xl`
- **Тени:** `shadow-2xl` для глубины

---

## 📝 Документация

Полная документация доступна в файле **UI_PATTERNS.md**

---

## ✨ Особенности

- ✅ **Полная типизация** TypeScript
- ✅ **Анимации** Framer Motion
- ✅ **Доступность** ARIA-атрибуты
- ✅ **Адаптивность** Mobile-first
- ✅ **Тёмная тема** Готовность
- ✅ **Без ошибок** 100% компиляция

---

## 🔧 Зависимости

Все необходимые зависимости уже установлены:

```json
{
  "framer-motion": "^12.34.5",
  "lucide-react": "^0.562.0",
  "tailwindcss": "^3.4.19"
}
```

---

## 📞 Поддержка

Вопросы и предложения: Андрей Осьмаков

---

**Версия:** 1.0.0  
**Дата:** Март 2026  
**Статус:** ✅ Готово к использованию

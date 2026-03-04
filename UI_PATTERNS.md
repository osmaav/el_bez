# UI Patterns Documentation

Современные UI-паттерны для приложения el-bez.

## 📦 Созданные компоненты

### 1. ToastMessage — Система уведомлений

**Путь:** `src/components/ui/toast-message.tsx`

Компонент для отображения toast-уведомлений с различными типами, прогрессом и действиями.

#### Типы уведомлений:
- `success` — успешное завершение
- `error` — ошибка
- `warning` — предупреждение
- `info` — информация
- `loading` — загрузка

#### Использование:

```tsx
import { ToastContainer, ToastMessage } from '@/components/ui/toast-message';
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { success, error, warning, info, loading, toasts, removeToast } = useToast();

  const handleSave = () => {
    success('Сохранено', 'Данные успешно сохранены');
  };

  const handleError = () => {
    error('Ошибка', 'Не удалось сохранить данные');
  };

  return (
    <>
      <Button onClick={handleSave}>Сохранить</Button>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
}
```

#### API:

```typescript
interface ToastOptions {
  id?: string;
  title: string;
  description?: string;
  type?: ToastType;
  action?: { label: string; onClick: () => void };
  duration?: number; // мс, по умолчанию 5000
  showProgress?: boolean;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}
```

---

### 2. ConfirmModal — Модальное окно подтверждения

**Путь:** `src/components/ui/confirm-modal.tsx`

Современное модальное окно для подтверждения важных действий.

#### Типы:
- `default` — стандартное
- `danger` — опасное действие (красный)
- `warning` — предупреждение (жёлтый)
- `info` — информационное (синий)

#### Использование:

```tsx
import { ConfirmModal } from '@/components/ui/confirm-modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Удалить</Button>
      
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={async () => {
          await deleteItem();
          setIsOpen(false);
        }}
        title="Удаление элемента"
        description="Вы уверены? Это действие нельзя отменить."
        type="danger"
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />
    </>
  );
}
```

#### API:

```typescript
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  type?: 'default' | 'danger' | 'warning' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode; // дополнительный контент
}
```

---

### 3. SuccessModal — Модальное окно успеха

**Путь:** `src/components/ui/success-modal.tsx`

Красивое модальное окно для поздравлений и подтверждений успешных действий.

#### Иконки:
- `check` — галочка
- `sparkles` — блёстки
- `trophy` — трофей
- `star` — звезда
- `award` — награда

#### Использование:

```tsx
import { SuccessModal } from '@/components/ui/success-modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Показать успех</Button>
      
      <SuccessModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Поздравляем!"
        description="Вы успешно завершили тестирование"
        icon="trophy"
        showConfetti={true}
        autoClose={5000}
        action={{
          label: 'Продолжить',
          onClick: () => console.log('Continue'),
        }}
      />
    </>
  );
}
```

#### API:

```typescript
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: 'check' | 'sparkles' | 'trophy' | 'star' | 'award';
  showConfetti?: boolean;
  autoClose?: number; // мс
  action?: { label: string; onClick: () => void };
  children?: React.ReactNode;
}
```

---

### 4. LoadingModal — Модальное окно загрузки

**Путь:** `src/components/ui/loading-modal.tsx`

Отслеживание прогресса операций с анимациями.

#### Типы:
- `default` — стандартный
- `upload` — загрузка
- `download` — скачивание
- `save` — сохранение
- `sync` — синхронизация

#### Статусы:
- `loading` — загрузка
- `success` — успех
- `error` — ошибка

#### Использование:

```tsx
import { LoadingModal } from '@/components/ui/loading-modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Загрузить</Button>
      
      <LoadingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Загрузка файла"
        description="Пожалуйста, подождите..."
        type="upload"
        status="loading"
        progress={progress}
        showProgress={true}
        indeterminate={false}
        onCancel={() => console.log('Cancelled')}
      />
    </>
  );
}
```

#### API:

```typescript
interface LoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: 'default' | 'upload' | 'download' | 'save' | 'sync';
  status?: 'loading' | 'success' | 'error';
  progress?: number; // 0-100
  showProgress?: boolean;
  indeterminate?: boolean;
  error?: string;
  onCancel?: () => void;
  cancelLabel?: string;
}
```

---

### 5. BottomSheet — Нижняя панель

**Путь:** `src/components/ui/bottom-sheet.tsx`

Выезжающая панель для мобильных устройств с поддержкой свайпов.

#### Использование:

```tsx
import {
  BottomSheet,
  BottomSheetItem,
  BottomSheetHeader,
} from '@/components/ui/bottom-sheet';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Открыть</Button>
      
      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={
          <BottomSheetHeader
            icon={<Settings className="h-6 w-6" />}
            title="Действия"
            description="Выберите нужное действие"
          />
        }
        size="md" // sm | md | lg | full
        snapPoints={[0.5, 0.75, 1]}
      >
        <BottomSheetItem
          icon={<Edit3 className="h-5 w-5" />}
          label="Редактировать"
          description="Изменить данные"
          onClick={() => console.log('Edit')}
        />
        <BottomSheetItem
          icon={<Trash2 className="h-5 w-5 text-red-600" />}
          label="Удалить"
          destructive
          onClick={() => console.log('Delete')}
        />
      </BottomSheet>
    </>
  );
}
```

#### API:

```typescript
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  snapPoints?: number[]; // [0.5, 0.75, 1]
  defaultSnap?: number;
  closeOnOverlay?: boolean;
  showHandle?: boolean;
}

interface BottomSheetItemProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  badge?: string | number;
}
```

---

### 6. RichTooltip — Богатые подсказки

**Путь:** `src/components/ui/rich-tooltip.tsx`

Подсказки с богатым контентом, иконками и действиями.

#### Типы:
- `default` — стандартный
- `info` — информационный
- `warning` — предупреждение
- `error` — ошибка
- `success` — успех
- `tip` — совет (градиент)

#### Использование:

```tsx
import { RichTooltip, QuickTooltip } from '@/components/ui/rich-tooltip';

function MyComponent() {
  return (
    <div className="space-x-4">
      {/* Rich Tooltip с действием */}
      <RichTooltip
        type="info"
        title="Подсказка"
        content="Подробное описание с полезной информацией"
        position="top"
        action={{
          label: 'Узнать больше',
          onClick: () => console.log('Learn more'),
        }}
      >
        <Button>Info</Button>
      </RichTooltip>

      {/* Quick Tooltip для простых случаев */}
      <QuickTooltip content="Простая подсказка">
        <Button>Help</Button>
      </QuickTooltip>
    </div>
  );
}
```

#### API:

```typescript
interface RichTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  type?: 'default' | 'info' | 'warning' | 'error' | 'success' | 'tip';
  title?: string;
  icon?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  showArrow?: boolean;
  maxWidth?: number;
  delay?: number; // мс
  duration?: number; // секунды
  closeable?: boolean;
  action?: { label: string; onClick: () => void };
}
```

---

### 7. useToast — Хук для уведомлений

**Путь:** `src/hooks/use-toast.ts`

Хук для удобного управления toast-уведомлениями.

#### Использование:

```tsx
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    loading,
    updateToast,
  } = useToast(5); // макс. 5 уведомлений

  const handleSubmit = async () => {
    const loadingId = loading('Отправка', 'Пожалуйста, подождите...');
    
    try {
      await api.submit();
      removeToast(loadingId);
      success('Готово!', 'Данные отправлены');
    } catch (err) {
      removeToast(loadingId);
      error('Ошибка', 'Не удалось отправить данные');
    }
  };

  return (
    <>
      <Button onClick={handleSubmit}>Отправить</Button>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
}
```

#### API:

```typescript
interface UseToastReturn {
  toasts: Toast[];
  addToast: (options: Omit<ToastOptions, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  error: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  warning: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  info: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  loading: (title: string, description?: string, options?: Partial<ToastOptions>) => string;
  updateToast: (id: string, options: Partial<ToastOptions>) => void;
}
```

---

### 8. Глобальный toast (опционально)

Для использования вне React-компонентов:

```tsx
// В корне приложения
import { setGlobalToastCallback, useToast } from '@/hooks/use-toast';

function App() {
  const { addToast } = useToast();
  
  useEffect(() => {
    setGlobalToastCallback(addToast);
  }, [addToast]);
  
  return <... />;
}

// В любом месте (сервисы, утилиты)
import { toast } from '@/hooks/use-toast';

toast.success('Успех!', 'Данные сохранены');
toast.error('Ошибка', 'Что-то пошло не так');
```

---

## 🎨 Дизайнерские принципы

### Цветовая палитра

| Тип | Фон | Иконка | Прогресс |
|-----|-----|--------|----------|
| Success | `emerald-50` | `emerald-600` | `emerald-500` |
| Error | `red-50` | `red-600` | `red-500` |
| Warning | `amber-50` | `amber-600` | `amber-500` |
| Info | `blue-50` | `blue-600` | `blue-500` |
| Loading | `slate-50` | `slate-600` | `slate-500` |

### Анимации

- **Появление:** `spring` с stiffness 500, damping 30
- **Исчезновение:** `duration 0.2s`
- **Прогресс:** `linear` transition

### Отступы и размеры

- Модальные окна: `max-w-md` (448px)
- Toast: `max-w-[400px]`
- Скругления: `rounded-2xl` / `rounded-3xl`
- Тени: `shadow-2xl`

---

## 📁 Структура файлов

```
src/
├── components/
│   ├── ui/
│   │   ├── toast-message.tsx       # Toast уведомления
│   │   ├── confirm-modal.tsx       # ConfirmModal
│   │   ├── success-modal.tsx       # SuccessModal
│   │   ├── loading-modal.tsx       # LoadingModal
│   │   ├── bottom-sheet.tsx        # BottomSheet
│   │   └── rich-tooltip.tsx        # RichTooltip
│   └── ui-showcase/
│       └── UIPatternsShowcase.tsx  # Демо-страница
└── hooks/
    └── use-toast.ts                # Хук useToast
```

---

## 🚀 Быстрый старт

1. **Импортируйте хук:**
   ```tsx
   import { useToast } from '@/hooks/use-toast';
   ```

2. **Используйте в компоненте:**
   ```tsx
   const { success, error } = useToast();
   
   const handleClick = () => {
     success('Готово!', 'Действие выполнено');
   };
   ```

3. **Добавьте контейнер:**
   ```tsx
   import { ToastContainer } from '@/components/ui/toast-message';
   
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

---

## 🎯 Примеры использования

### Сохранение формы

```tsx
const handleSubmit = async (data: FormData) => {
  const loadingId = loading('Сохранение', 'Пожалуйста, подождите...');
  
  try {
    await api.save(data);
    removeToast(loadingId);
    success('Сохранено', 'Данные успешно сохранены');
  } catch (err) {
    removeToast(loadingId);
    error('Ошибка', 'Не удалось сохранить данные');
  }
};
```

### Подтверждение удаления

```tsx
const handleDelete = () => {
  ConfirmModal({
    isOpen: true,
    onClose: () => setIsOpen(false),
    onConfirm: async () => {
      await api.delete(id);
      success('Удалено', 'Элемент удалён');
    },
    title: 'Удаление',
    description: 'Вы уверены? Это действие нельзя отменить.',
    type: 'danger',
  });
};
```

### Загрузка файла

```tsx
const handleUpload = async (file: File) => {
  setLoadingModal({
    isOpen: true,
    type: 'upload',
    status: 'loading',
    progress: 0,
  });
  
  const xhr = new XMLHttpRequest();
  xhr.upload.onprogress = (e) => {
    const progress = Math.round((e.loaded / e.total) * 100);
    setLoadingModal(prev => ({ ...prev, progress }));
  };
  xhr.onload = () => {
    setLoadingModal(prev => ({ ...prev, status: 'success' }));
  };
};
```

---

## 📝 Заметки

- Все компоненты поддерживают **тёмную тему** (через CSS variables)
- Анимации используют **Framer Motion** для плавности
- Компоненты **доступны** (ARIA attributes)
- Полная **адаптивность** для мобильных устройств

---

*Версия: 1.0.0 | Дата: Март 2026*

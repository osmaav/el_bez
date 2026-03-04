# 🔐 Auth Modals — Обновлённые модальные окна

## 📦 Что изменилось

### Версия 2.0.0

Модальные окна входа и регистрации полностью переписаны с использованием современных UI-паттернов.

---

## ✨ Новые возможности

### LoginModal (Вход)

**Новый дизайн:**
- ✅ Градиентная иконка с `LogIn`
- ✅ Иконки полей (Email, Пароль)
- ✅ Автозаполнение email из localStorage
- ✅ Кнопка «Продолжить без регистрации»
- ✅ Анимация `scale` через AnimatedModal
- ✅ Сохранение email после успешного входа

**Визуальные улучшения:**
- Градиент: `from-blue-500 to-indigo-600`
- Тень: `shadow-lg shadow-blue-500/25`
- Скругления: `rounded-2xl`
- Плавные hover-эффекты

---

### RegisterModal (Регистрация)

**Новый дизайн:**
- ✅ Градиентная иконка с `UserPlus`
- ✅ Иконки для всех полей
- ✅ Автозаполнение из localStorage
- ✅ Валидация с мгновенной обратной связью
- ✅ Проверка email на существование
- ✅ Анимация `scale` через AnimatedModal

**Поля с иконками:**
- Фамилия/Имя — `User`
- Дата рождения — `Calendar`
- Место работы — `Building`
- Должность — `Briefcase`
- Email — `Mail`
- Пароль — `Lock`

**Визуальные улучшения:**
- Градиент: `from-emerald-500 to-teal-600`
- Тень: `shadow-lg shadow-emerald-500/25`
- Сетка для полей (2 колонки)
- Улучшенная валидация

---

## 🎨 Дизайн-система

### Цветовая схема

| Компонент | Градиент | Тень |
|-----------|----------|------|
| Login | `blue → indigo` | `shadow-blue-500/25` |
| Register | `emerald → teal` | `shadow-emerald-500/25` |

### Иконки

**Lucide React:**
- `LogIn` — вход
- `UserPlus` — регистрация
- `Mail` — email
- `Lock` — пароль
- `User` — ФИО
- `Calendar` — дата
- `Building` — организация
- `Briefcase` — должность
- `Eye` / `EyeOff` — показать/скрыть пароль

### Анимации

**Кнопки:**
```tsx
className="bg-gradient-to-r from-blue-600 to-indigo-600 
           hover:from-blue-700 hover:to-indigo-700 
           shadow-lg shadow-blue-500/25"
```

**Загрузка:**
```tsx
<span className="w-4 h-4 border-2 border-white/30 
                 border-t-white rounded-full animate-spin" />
```

---

## 🔧 Технические улучшения

### 1. AnimatedModal

Оба окна используют новый компонент `AnimatedModal`:

```tsx
<AnimatedModal
  isOpen={isOpen}
  onClose={onClose}
  animation="scale"
  size="md"  // или "lg" для регистрации
  showCloseButton={true}
>
  {/* Контент */}
</AnimatedModal>
```

**Преимущества:**
- Плавная анимация появления/исчезновения
- Закрытие по Escape
- Блокировка скролла фона
- ARIA-атрибуты для доступности

---

### 2. Автозаполнение

**LoginModal:**
```tsx
// Сохранение email
localStorage.setItem('elbez_last_email', formData.email);

// Загрузка при открытии
const savedEmail = localStorage.getItem('elbez_last_email');
```

**RegisterModal:**
```tsx
// Сохранение формы (кроме пароля)
localStorage.setItem('elbez_register_form', JSON.stringify(updatedData));

// Загрузка при монтировании
const savedForm = localStorage.getItem('elbez_register_form');
```

---

### 3. Валидация

**Мгновенная обратная связь:**
```tsx
// Очистка ошибки при изменении
if (validationErrors[name as keyof ValidationErrors]) {
  setValidationErrors(prev => ({ ...prev, [name]: undefined }));
}
```

**Проверка email:**
```tsx
// При потере фокуса
const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  setEmailTouched(true);
  if (emailRegex.test(email)) {
    checkEmail(email);
  }
};
```

---

## 📁 Структура

```
src/components/
├── LoginModal.tsx       ✅ v2.0.0
├── RegisterModal.tsx    ✅ v2.0.0
└── ui/
    └── animated-modal.tsx  ← используется в модалках
```

---

## 🚀 Использование

### В Navigation

```tsx
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';

function Navigation() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowLoginModal(true)}>Войти</Button>
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onOpenRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onOpenLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
}
```

---

## 🎯 Ключевые изменения

| Было | Стало |
|------|-------|
| Простая карточка | AnimatedModal с анимацией |
| Стандартные input | Input с иконками |
| Обычная кнопка | Градиентная с тенью |
| Нет автосохранения | localStorage для всех данных |
| Минимальная валидация | Мгновенная обратная связь |
| Один стиль | Уникальные градиенты |

---

## 📊 Сравнение размеров

| Параметр | v1.0 | v2.0 |
|----------|------|------|
| Строк кода | ~180 | ~280 |
| Компонентов | 1 | 1 + AnimatedModal |
| Иконок | 2 | 8 |
| Анимаций | 1 | 5+ |

---

## ✅ Чек-лист

- [x] Градиентные кнопки
- [x] Иконки для всех полей
- [x] Автозаполнение из localStorage
- [x] Валидация с обратной связью
- [x] Проверка email
- [x] Анимация загрузки
- [x] Переключение между входом/регистрацией
- [x] Кнопка «Продолжить без входа»
- [x] Доступность (ARIA)
- [x] Адаптивность (mobile-first)

---

## 🎨 Скриншоты

### LoginModal
```
┌─────────────────────────────────┐
│  [🔐 LogIn]                     │
│   С возвращением!               │
│   Войдите для доступа           │
├─────────────────────────────────┤
│  📧 Email                       │
│  [example@mail.ru]              │
│                                 │
│  🔒 Пароль                      │
│  [••••••••]           [👁]      │
│                                 │
│  [    Войти    ] ← градиент     │
│                                 │
│  Нет аккаунта? Зарегистрироваться│
├─────────────────────────────────┤
│  Или продолжите без входа       │
│  [Продолжить без регистрации]   │
└─────────────────────────────────┘
```

### RegisterModal
```
┌─────────────────────────────────┐
│  [👤 UserPlus]                  │
│   Создание аккаунта             │
│   Заполните форму               │
├─────────────────────────────────┤
│  [Фамилия] [Имя]                │
│  [Отчество]                     │
│  [📅 Дата рождения]             │
│  [Место работы] [Должность]     │
│  [📧 Email]                     │
│  [🔒 Пароль]                    │
│                                 │
│  [ Зарегистрироваться ] ← gradient│
│                                 │
│  Уже есть аккаунт? Войти        │
└─────────────────────────────────┘
```

---

## 🔗 Связанные компоненты

- [`AnimatedModal`](./UI_PATTERNS_COMPLETE.md#8-animatedmodal)
- [`Button`](./src/components/ui/button.tsx)
- [`Input`](./src/components/ui/input.tsx)
- [`Label`](./src/components/ui/label.tsx)
- [`Alert`](./src/components/ui/alert.tsx)

---

**Версия:** 2.0.0  
**Дата:** Март 2026  
**Статус:** ✅ Готово к использованию

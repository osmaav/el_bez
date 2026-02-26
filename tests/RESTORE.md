# 🔥 Как вернуть тестовую страницу Firebase

Тестовые компоненты были перемещены в директорию `tests/` для сохранения.

## Быстрое восстановление

### Шаг 1: Добавьте маршрут в App.tsx

Откройте `src/App.tsx` и добавьте:

```tsx
// В импорты:
import { FirebaseTestPage } from '@/tests/FirebaseTestPage';

// В Routes (после /register):
<Route path="/firebase-test" element={<FirebaseTestPage />} />
```

**Полный пример:**

```tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RegisterPage } from '@/pages/RegisterPage';
import { FirebaseTestPage } from '@/tests/FirebaseTestPage'; // ← Добавить

function AppContent() {
  // ...
}

function App() {
  return (
    <CookiesProvider>
      <BrowserRouter>
        <AppProvider>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/firebase-test" element={<FirebaseTestPage />} /> {/* ← Добавить */}
            <Route path="/*" element={<AppContent />} />
          </Routes>
          <Toaster />
        </AppProvider>
      </BrowserRouter>
    </CookiesProvider>
  );
}

export default App;
```

### Шаг 2: Проверьте сборку

```bash
npm run build
```

### Шаг 3: Откройте тестовую страницу

```
http://localhost:5173/firebase-test
```

## Функционал

После восстановления вы получите доступ к:

- ✅ 6 тестов Firebase
- ✅ Детальные логи с временными метками
- ✅ Отладка переменных окружения (EnvDebug)
- ✅ Экспорт логов в файл
- ✅ Проверка регистрации пользователя

## Удаление (когда больше не нужно)

1. Удалите маршрут из `App.tsx`
2. Удалите импорт `FirebaseTestPage`
3. Удалите директорию `tests/`

```bash
rm -rf app/tests
```

---

**Дата:** 25 февраля 2026 г.

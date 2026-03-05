# 🚀 Инструкция по развёртыванию исправлений

## 📦 Изменения

Исправлены проблемы в разделе "Обучение":
- ✅ Фильтр вопросов теперь работает корректно
- ✅ Прогресс сохраняется при переходе между страницами
- ✅ Статистика записывается через SessionTracker
- ✅ Прогресс загружается из Firestore/localStorage при инициализации

## 📁 Изменённые файлы

### Основные изменения
- `src/components/statistics/QuestionFilter.tsx` (+21 строка)
- `src/sections/LearningSection.tsx` (+118 строк)
- `src/sections/TrainerSection.tsx` (+5 строк)

### Форматирование
- `src/components/Navigation.tsx` (отступы)

### Сборка
- `docs/index.html` (обновлены хеши файлов)
- `docs/assets/*.js` (новая сборка)

---

## 🔧 Развёртывание

### Вариант 1: GitHub Pages (автоматически)

```bash
# 1. Проверка изменений
git status

# 2. Добавление файлов
git add src/components/statistics/QuestionFilter.tsx
git add src/sections/LearningSection.tsx
git add src/sections/TrainerSection.tsx
git add src/components/Navigation.tsx
git add docs/

# 3. Коммит
git commit -m "fix(learning): исправление сохранения прогресса и работы фильтра

- Добавлена загрузка прогресса из Firestore/localStorage при инициализации
- SessionTracker теперь создаётся для режима обучения
- Исправлена рассинхронизация savedStates и savedStatesRef
- QuestionFilter теперь сохраняет настройки в questionFilterService
- filteredQuestions обновляется корректно при применении фильтра
- Восстановление состояния страницы через savedStatesRef предотвращает гонки

Fixes: фильтр не применялся, прогресс сбрасывался при переходе между страницами"

# 4. Отправка в репозиторий
git push origin master

# 5. GitHub Actions автоматически соберёт и задеплоит на GitHub Pages
```

### Вариант 2: Локальная проверка

```bash
# 1. Установка зависимостей (если нужно)
npm install

# 2. Запуск dev-сервера
npm run dev

# 3. Проверка в браузере
open http://localhost:5173

# 4. Тестирование (см. TEST_CHECKLIST.md)

# 5. Сборка для продакшена
npm run build

# 6. Предпросмотр сборки
npm run preview
```

---

## ✅ Проверка после развёртывания

### 1. GitHub Pages
- [ ] Открыть https://osmaav.github.io/el_bez/
- [ ] Проверить раздел "Обучение"
- [ ] Применить фильтр → вопросы перестраиваются
- [ ] Ответить на вопросы → перейти на следующую страницу → вернуться → прогресс сохранён

### 2. Консоль браузера
- [ ] Нет ошибок JavaScript
- [ ] Логи: "📊 [LearningSection] SessionTracker создан"
- [ ] Логи: "✅ [LearningSection] Прогресс загружен"

### 3. Firebase Console
- [ ] Проверить Firestore → user_states → {userId} → learningProgress
- [ ] Прогресс сохраняется корректно

---

## 🔄 Откат изменений (если нужно)

```bash
# 1. Откат последнего коммита
git revert HEAD

# 2. Или сброс к предыдущей версии
git reset --hard HEAD~1

# 3. Принудительный пуш (осторожно!)
git push -f origin master

# 4. Или восстановить из тега
git checkout <previous-tag>
git push origin master
```

---

## 📊 Метрики после развёртывания

| Метрика | До | После |
|---------|-----|-------|
| Фильтр работает | ❌ | ✅ |
| Прогресс сохраняется | ❌ | ✅ |
| SessionTracker создан | ❌ | ✅ |
| Загрузка из Firestore | ❌ | ✅ |

---

## 🐛 Если что-то пошло не так

### Проблема: Фильтр не применяется
**Решение:** Проверить консоль на ошибки, убедиться что `questionFilterService` импортирован

### Проблема: Прогресс не сохраняется
**Решение:** Проверить что `loadLearningProgress` импортирован и вызывается при инициализации

### Проблема: SessionTracker не создан
**Решение:** Проверить логи в консоли, убедиться что `questions.length > 0`

### Проблема: Ошибки TypeScript
**Решение:** 
```bash
npm run build
# Исправить ошибки
git add <исправленные файлы>
git commit -m "fix: исправление ошибок TypeScript"
git push
```

---

## 📞 Контакты

При возникновении проблем:
- GitHub Issues: https://github.com/osmaav/el_bez/issues
- Email: [указать при необходимости]

---

**Дата:** 5 марта 2026  
**Версия:** 2026.06.0-fix2  
**Статус:** ✅ Готово к развёртыванию

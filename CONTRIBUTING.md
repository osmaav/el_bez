# Руководство для участников проекта

## Вклад в проект

Мы приветствуем вклад в развитие проекта! Ниже приведены рекомендации для эффективного сотрудничества.

## О проекте

**el-bez** — современное веб-приложение для подготовки к экзаменам по электробезопасности.

### Текущая статистика
- **3110 вопросов** в базе
- **15 разделов** (II-V группы допуска)
- **319 экзаменационных билетов**
- **527 автоматических тестов** (100% покрытие)
- **Нормативные ссылки** для каждого вопроса

### Технологии
- **Frontend:** React 19, TypeScript, Vite
- **UI:** Tailwind CSS, shadcn/ui, Radix UI
- **Backend:** Firebase Firestore, Firebase Auth
- **Testing:** Vitest, Testing Library

## Как внести изменения

### 1. Fork и клонирование

```bash
# Создайте fork репозитория на GitHub
# Затем клонируйте свою копию
git clone https://github.com/YOUR_USERNAME/el_bez.git
cd el_bez

# Добавьте оригинальный репозиторий как upstream
git remote add upstream https://github.com/osmaav/el_bez.git
```

### 2. Создание ветки

```bash
# Обновите локальную ветку
git checkout master
git pull upstream master

# Создайте новую ветку для функции
git checkout -b feature/your-feature-name
```

### 3. Внесение изменений

- Следуйте существующему стилю кода
- Добавляйте комментарии только для сложной логики
- Используйте TypeScript для типизации

### 4. Тестирование

```bash
# Установите зависимости
npm install

# Запустите dev-сервер
npm run dev

# Проверьте линтером
npm run lint

# Соберите проект
npm run build
```

### 5. Коммиты

Используйте [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: добавить новую функцию
fix: исправить ошибку
docs: обновить документацию
style: исправить стиль кода
refactor: рефакторинг кода
test: добавить тесты
chore: обновить зависимости
```

Примеры:
```bash
git commit -m "feat: добавить режим марафона"
git commit -m "fix: исправить ошибку в калькуляторе"
git commit -m "docs: обновить README"
```

### 6. Пуш и Pull Request

```bash
# Отправьте изменения в свой fork
git push origin feature/your-feature-name

# Создайте Pull Request на GitHub
```

## Структура проекта

```
src/
├── components/     # UI-компоненты
│   └── ui/        # Компоненты shadcn/ui
├── context/       # React Context
├── sections/      # Секции приложения
├── types/         # TypeScript-типы
├── hooks/         # Кастомные хуки
├── services/      # Сервисы (auth, questions, statistics)
└── tests/         # Тесты
```

**Примечание:** Папка `scripts/` исключена из репозитория (.gitignore) и содержит локальные скрипты для работы с БД.

## Стандарты кода

### TypeScript

- Используйте строгую типизацию
- Избегайте `any`
- Экспортируйте типы в `src/types/`

### React

- Функциональные компоненты с хуками
- Используйте TypeScript для props
- Следуйте правилам хуков

### CSS/Tailwind

- Используйте utility-классы Tailwind
- Следуйте существующим паттернам
- Мобильная адаптивность через `sm:`, `md:`, `lg:`

## Добавление вопросов

Вопросы хранятся в Firebase Firestore. Для добавления вопросов используйте скрипты в локальной папке `scripts/` (не входит в репозиторий).

Формат вопроса:
```json
{
  "id": 305,
  "ticket": 1,
  "section": "1258-20",
  "question": "Текст вопроса?",
  "answers": [
    "Вариант 1",
    "Вариант 2",
    "Вариант 3",
    "Вариант 4"
  ],
  "correct": [2],
  "link": "ПУЭ п.1.7.137 - Присоединение заземляющих проводников..."
}
```

Поля:
- `id` — уникальный номер
- `ticket` — номер билета (опционально)
- `question` — текст вопроса
- `answers` — массив вариантов ответов
- `correct` — индекс правильного ответа (0-3)
- `link` — источник (ПУЭ, Приказ и т.д.)

## Отладка

### Console logs

Используйте префиксы для логирования:

```typescript
console.log('🔵 Info message');
console.error('❌ Error message');
console.warn('⚠️ Warning message');
console.log('✅ Success message');
console.log('💾 Save to localStorage');
```

### React DevTools

Установите расширение для браузера:
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools)

## CI/CD

### GitHub Actions

Автоматический деплой при пуше в `master`:

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [ master ]
```

### Проверка статуса

1. https://github.com/osmaav/el_bez/actions
2. Проверьте последний workflow
3. Убедитесь в успешном завершении

## Документация

### Обновление README

- Актуализируйте скриншоты
- Обновите статистику
- Добавьте новые функции

### CHANGELOG

Ведите историю изменений в `CHANGELOG.md`:

```markdown
## [2026.03] — 2026-03-01

### Добавлено
- Новая функция

### Исправлено
- Исправление ошибки
```

## Контакты

- **Issues:** https://github.com/osmaav/el_bez/issues
- **Discussions:** https://github.com/osmaav/el_bez/discussions

## Лицензия

MIT License — см. файл [LICENSE](LICENSE).

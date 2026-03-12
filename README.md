# 🎓 el-bez — Тесты по электробезопасности

**el-bez** — современное веб-приложение для подготовки к сдаче экзаменов по электробезопасности (III и IV группа до 1000 В).

[![Version](https://img.shields.io/badge/version-2026.03.12.00-green.svg)](RELEASE_2026.03.12.00.md)
[![Tests](https://img.shields.io/badge/tests-478_(97%25)-brightgreen.svg)](TESTING.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📖 Описание

Приложение предназначено для самостоятельной подготовки к проверке знаний по электробезопасности. Содержит актуальные вопросы из тестов Ростехнадзора для III и IV группы допуска до 1000 В.

### 🎯 Особенности

- ✅ **560 вопросов** из актуальной базы Ростехнадзора
- ✅ **Два раздела:** ЭБ 1256.19 (III группа) и ЭБ 1258.20 (IV группа)
- ✅ **56 экзаменационных билетов** по 10 вопросов
- ✅ **478 автоматизированных тестов** (97% покрытие)
- ✅ **Firebase Firestore** — облачное хранение вопросов и прогресса
- ✅ **Система аутентификации** — регистрация, вход, восстановление пароля
- ✅ **Режим обучения** — по 10 вопросов на странице с сохранением прогресса
- ✅ **Тренажёр** — случайная выборка 20 или 50 вопросов
- ✅ **Экзамен** — имитация реального тестирования по билетам
- ✅ **Статистика** — графики, метрики, активность по дням
- ✅ **Экспорт в PDF** — сохранение результатов обучения, тренажёра и экзамена
- ✅ **Адаптивный дизайн** — оптимизация для мобильных и десктопов
- ✅ **Тёмная тема** — переключатель темы оформления

---

## 🚀 Быстрый старт

```bash
# Клонирование репозитория
git clone https://github.com/osmaav/el_bez.git
cd el-bez/app

# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Запуск тестов
npm run test

# Сборка для продакшена
npm run build
```

---

## 📚 Режимы работы

### 🎓 Обучение
- По 10 вопросов на странице
- Сохранение прогресса в Firestore
- Переход между страницами
- Глобальный прогресс по разделу
- Экспорт результатов в PDF

### 🏋️ Тренажёр
- Выбор количества вопросов (20 или 50)
- Случайная выборка из базы
- Мгновенная обратная связь
- Статистика в реальном времени
- Экспорт результатов в PDF

### 📝 Экзамен
- 56 билетов по 10 вопросов
- Имитация реального экзамена
- Проходной балл: 80% (8 из 10)
- Детальный разбор результатов
- Экспорт билета в PDF

### 📊 Статистика
- Общая статистика по разделам
- Активность по дням
- Прогресс обучения
- Лучшая сессия
- Экспорт статистики в PDF

---

## 🛠 Технологии

| Категория | Технологии |
|-----------|------------|
| **Frontend** | React 19, TypeScript, Vite |
| **UI** | Tailwind CSS, shadcn/ui, Radix UI |
| **State** | React Context API, Custom Hooks |
| **Backend** | Firebase Firestore, Firebase Auth |
| **Storage** | Firestore, localStorage |
| **Testing** | Vitest, Testing Library |
| **Build** | npm, Vite, TypeScript |

---

## 📊 База вопросов

| Параметр | ЭБ 1256.19 | ЭБ 1258.20 | Всего |
|----------|------------|------------|-------|
| Всего вопросов | 250 | 310 | **560** |
| Билетов в экзамене | 25 | 31 | **56** |
| Вопросов в билете | 10 | 10 | **10** |
| Группа допуска | III | IV | — |
| Напряжение | до 1000 В | до 1000 В | до 1000 В |

---

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm run test

# По секциям
npm run test -- learning
npm run test -- trainer
npm run test -- exam
npm run test -- statistics

# По группам
npm run test -- ui
npm run test -- math
npm run test -- state
npm run test -- filter
npm run test -- firebase
```

### Покрытие тестами

| Секция | Тестов | % прохождения |
|--------|--------|---------------|
| Learning | 207 | 94% |
| Trainer | 78 | 100% |
| Exam | 109 | 100% |
| Statistics | 66 | 100% |
| **ВСЕГО** | **478** | **97%** |

📄 **Подробная документация:** [TESTING.md](TESTING.md)

---

## 📁 Структура проекта

```
el-bez/
├── app/
│   ├── .github/workflows/      # CI/CD конфигурация
│   ├── docs/                   # Продакшен-сборка
│   ├── scripts/                # Скрипты миграции
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # UI-компоненты (shadcn/ui)
│   │   │   ├── learning/       # Компоненты обучения
│   │   │   └── Navigation.tsx
│   │   ├── context/
│   │   │   ├── AppContext.tsx
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useLearningProgress.ts
│   │   │   ├── useLearningFilter.ts
│   │   │   └── useLearningNavigation.ts
│   │   ├── sections/
│   │   │   ├── LearningSection.tsx
│   │   │   ├── TheorySection.tsx
│   │   │   ├── TrainerSection.tsx
│   │   │   ├── ExamSection.tsx
│   │   │   └── StatisticsSection.tsx
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── questionService.ts
│   │   │   └── statisticsService.ts
│   │   ├── tests/
│   │   │   ├── learning/       # Тесты секции Learning
│   │   │   ├── trainer/        # Тесты секции Trainer
│   │   │   ├── exam/           # Тесты секции Exam
│   │   │   ├── statistics/     # Тесты секции Statistics
│   │   │   └── utils/          # Утилиты для тестов
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   └── index.ts
│   │   └── lib/
│   │       ├── firebase.ts
│   │       └── utils.ts
│   ├── package.json
│   └── vite.config.ts
├── TESTING.md                  # Документация тестов
├── MERGE_GUIDE.md              # Инструкция по слиянию
├── VERSIONING.md               # Правила версионирования
└── README.md                   # Этот файл
```

---

## 🏷️ Версионирование

Используется формат **ГГГГ.ММ.ДД.XX**:

- `.00` — Основной релиз
- `.01–.09` — Исправления (hotfix)
- `.10–.99` — Новый функционал (feature)

### Последние релизы

| Версия | Дата | Описание |
|--------|------|----------|
| [2026.03.12.02](RELEASE_2026.03.12.00.md) | 12.03.2026 | Удаление несуществующих контактов |
| [2026.03.12.01](RELEASE_2026.03.12.00.md) | 12.03.2026 | Исправление ошибок TypeScript |
| [2026.03.12.00](RELEASE_2026.03.12.00.md) | 12.03.2026 | Tests Integration (478 тестов) |

📄 **Подробнее:** [VERSIONING.md](VERSIONING.md)

---

## 🔧 Настройка Firebase

### 1. Создание проекта

1. Создайте проект в [Firebase Console](https://console.firebase.google.com/)
2. Включите Authentication (Email/Password)
3. Создайте Firestore Database

### 2. Конфигурация

Скопируйте конфигурацию в `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Загрузка вопросов

```bash
# Установите firebase-admin
npm install firebase-admin

# Запустите миграцию
node scripts/migrate-questions-to-firestore.cjs
```

---

## 📦 Деплой

### GitHub Pages (автоматически)

1. Включите GitHub Pages в настройках репозитория
2. Выберите источник: GitHub Actions
3. При пуше в `master` сборка и деплой выполняются автоматически

### Ручной деплой

```bash
# Сборка
npm run build

# Коммит и пуш
git add docs/
git commit -m "chore: build for production"
git push
```

---

## 🤝 Вклад в проект

1. Создайте fork репозитория
2. Создайте ветку (`git checkout -b feature/amazing-feature`)
3. Закоммитьте изменения (`git commit -m 'feat: add amazing feature'`)
4. Отправьте в fork (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

📄 **Подробнее:** [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 Лицензия

MIT License — см. файл [LICENSE](LICENSE) для деталей.

---

## 📞 Контакты

- **Репозиторий:** https://github.com/osmaav/el_bez
- **Issues:** https://github.com/osmaav/el_bez/issues
- **Демо:** https://osmaav.github.io/el_bez/

---

## ⚠️ Отказ от ответственности

Приложение предназначено исключительно для образовательных целей и самостоятельной подготовки. Вопросы взяты из открытых источников (тесты Ростехнадзора ЭБ 1256.19 и ЭБ 1258.20). Для официальной проверки знаний обращайтесь в аккредитованные центры Ростехнадзора.

---

## 📈 Roadmap

### ✅ Реализовано

- [x] Автоматизированные тесты (478 тестов, 97%)
- [x] Декомпозиция LearningSection на хуки и компоненты
- [x] Firebase моки для Auth и Database (102 теста)
- [x] Экспорт результатов в PDF
- [x] Правила версионирования ГГГГ.ММ.ДД.XX
- [x] Полная документация тестов

### 🔄 В разработке

- [ ] Режим «Марафон» — все 560 вопросов подряд
- [ ] Тёмная тема оформления
- [ ] Статистика по категориям вопросов
- [ ] Система достижений и рекордов

### 📅 Планы

- [ ] Мобильное приложение (React Native)
- [ ] Синхронизация между устройствами
- [ ] Режим «Работа над ошибками»
- [ ] Таймер времени ответа

---

**Версия:** 2026.03.12.00  
**Дата обновления:** 12 марта 2026  
**Последний релиз:** [2026.03.12.00 — Tests Integration](RELEASE_2026.03.12.00.md)

# 📊 Релиз 2026.03.29.00

**Дата релиза:** 29 марта 2026 г.  
**Предыдущий релиз:** 2026.03.26.00

---

## 🎯 Основные изменения

### Улучшения страницы "Статистика"

#### 1. Динамическое отображение разделов в "Прогресс по разделам"
**Компонент:** `SectionProgress.tsx`

**Изменения:**
- ✅ Показываются **только разделы, по которым есть результаты** (`totalAttempts > 0`)
- ✅ **Динамическая поддержка всех 19 разделов** через `statistics.sections`
- ✅ Сообщение "Пока нет результатов по разделам" если результатов нет

**Было:**
```tsx
// Жёстко закодированные разделы
const sections = [
  { id: '1256-19', name: 'ЭБ 1256.19', stats: stats1256 },
  { id: '1258-20', name: 'ЭБ 1258.20', stats: stats1258 },
];
```

**Стало:**
```tsx
// Динамически из статистики
const sectionsWithStats = Object.keys(statistics.sections)
  .filter(id => statistics.sections[id].totalAttempts > 0);
```

---

#### 2. Полное описание группы в "Темы для повторения"
**Компонент:** `WeakTopicsDetail.tsx`

**Изменения:**
- ✅ **Бейдж показывает полное описание раздела** из `SECTIONS`
- ✅ **Поддержка всех 19 разделов** (промышленные, непромышленные, ЭТЛ)
- ✅ Универсальная логика без жёстких проверок

**Было:**
```tsx
// Только для 2 разделов
{topic.section === '1256-19' ? 'III гр.' : topic.section === '1258-20' ? 'IV гр.' : ''}
```

**Стало:**
```tsx
// Для всех 19 разделов
{SECTIONS.find(s => s.id === topic.section)?.description || ''}
```

**Примеры отображения:**
| Раздел | Бейдж |
|--------|-------|
| 1256-19 | III группа до 1000 В |
| 1498-6 | IV группа до 1000 В (непромышленные) |
| 1365-11 | IV группа до и выше 1000 В (ЭТЛ) |

---

#### 3. Динамический подсчёт времени обучения
**Компонент:** `StatisticsOverviewTab.tsx`

**Изменения:**
- ✅ Общее время обучения считается **по всем разделам** через `Object.values().reduce()`
- ✅ Удалены жёсткие ссылки на `section1256Stats` и `section1258Stats`

**Было:**
```tsx
const totalTimeSpent = (section1256Stats?.totalTimeSpent || 0) + (section1258Stats?.totalTimeSpent || 0);
```

**Стало:**
```tsx
const totalTimeSpent = Object.values(statistics.sections)
  .reduce((sum, section) => sum + (section?.totalTimeSpent || 0), 0);
```

---

## 📝 Обновление нормативных цитат в Firebase

### Исправлено вопросов с неполными цитатами:
- ✅ **829 вопросов** обновлено с полными цитатами
- ✅ **19 вопросов** исправлено вручную
- ✅ **3110 вопросов** в Firebase Firestore обновлено

### Обновлены цитаты из:
- Приказ 796 (Правила работы с персоналом)
- ПТЭЭП (Правила технической эксплуатации)
- ПУЭ (Правила устройства электроустановок)
- ПОТЭЭ (Правила по охране труда)
- Приказ Минздрава №220н (Первая помощь)
- Приказ Минздрава №477н (Первая помощь)

---

## 🧪 Тестирование

Все тесты пройдены:
```
✓ src/components/statistics/__tests__/StatisticsSection.test.tsx (12 tests)
✓ src/components/statistics/__tests__/ActivityCalendar.test.tsx (22 tests)
✓ src/components/statistics/__tests__/WeakTopicsDetail.test.tsx (23 tests)

Test Files  3 passed (3)
Tests       57 passed (57)
```

---

## 📦 Изменённые файлы

### Компоненты:
- `src/components/statistics/SectionProgress.tsx`
- `src/components/statistics/WeakTopicsDetail.tsx`
- `src/pages/statistics/components/StatisticsOverviewTab.tsx`

### Тесты:
- `src/components/statistics/__tests__/WeakTopicsDetail.test.tsx`

### Конфигурация:
- `package.json` (версия 2026.03.29.00)

---

## 🚀 Развёртывание

### Обновление версии:
```bash
npm version 2026.03.29.00
```

### Запуск:
```bash
npm run dev
```

### Сборка:
```bash
npm run build
```

---

## 📋 Чек-лист релиза

- ✅ Изменения закоммичены
- ✅ Версия обновлена
- ✅ Тесты пройдены
- ✅ Линтинг пройден
- ✅ Документация обновлена
- ⏳ GitHub Release создан
- ⏳ Изменения опубликованы

---

## 🔗 Связанные задачи

- #2026.03.29-statistics-improvements
- #firebase-link-citations-update

---

## 📊 Статистика изменений

| Метрика | Значение |
|---------|----------|
| Изменено файлов | 4 |
| Добавлено строк | 77 |
| Удалено строк | 58 |
| Обновлённых вопросов | 829 |
| Пройдено тестов | 57 |

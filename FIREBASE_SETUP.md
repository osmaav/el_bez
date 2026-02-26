# 🔥 Настройка Firebase для регистрации пользователей

## Шаг 1: Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите **"Add project"** или **"Создать проект"**
3. Введите название проекта (например, `el-bez-auth`)
4. Отключите Google Analytics (опционально)
5. Нажмите **"Create project"**

---

## Шаг 2: Настройка Firebase Authentication

1. В левом меню выберите **"Build"** → **"Authentication"**
2. Нажмите **"Get started"**
3. Включите следующие методы входа:

### Email/Password
- Нажмите **"Email/Password"**
- Переключите в **"Enable"**
- Нажмите **"Save"**


### Custom OAuth (для Yandex)
- Нажмите **"Add new provider"** → **"OIDC"**
- Название: `Yandex`
- ID провайдера: `oidc.yandex`
- Client ID: Из Яндекс OAuth
- Client Secret: Из Яндекс OAuth
- Authorization endpoint: `https://oauth.yandex.ru/authorize`
- Token endpoint: `https://oauth.yandex.ru/token`
- User Info endpoint: `https://login.yandex.ru/info`
- Scopes: `email`

---

## Шаг 3: Настройка Firestore Database

1. В левом меню выберите **"Build"** → **"Firestore Database"**
2. Нажмите **"Create database"**
3. Выберите **"Start in test mode"** (для разработки)
4. Выберите регион: `europe-west` (или ближайший)
5. Нажмите **"Enable"**

### Правила безопасности Firestore

Перейдите во вкладку **"Rules"** и установите:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать и записывать только свои данные
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Запретить прямой доступ к другим коллекциям
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Шаг 4: Получение конфигурации Firebase

1. В левом меню выберите **"Project settings"** (шестерёнка)
2. Прокрутите вниз до **"Your apps"**
3. Нажмите **"Add app"** → **"Web"** (иконка `</>`)
4. Введите название приложения (например, `el-bez-web`)
5. Скопируйте конфигурацию:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Шаг 5: Настройка переменных окружения

1. Скопируйте файл `.env.example` в `.env.local`:
```bash
cp .env.example .env.local
```

2. Заполните `.env.local` значениями из Firebase:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Шаг 6: Настройка Яндекс OAuth

1. Перейдите в [Яндекс OAuth](https://oauth.yandex.ru/)
2. Нажмите **"Создать новое приложение"**
3. Заполните:
   - **Название**: `el-bez`
   - **Платформа**: **Web-сервисы**
   - **Redirect URI**: `https://your-project-id.firebaseapp.com/__/auth/handler`
4. Включите права:
   - `Яндекс.Почта` → `Получить доступ к email`
   - `Яндекс.Паспорт` → `Получить информацию о пользователе`
5. Сохраните **Client ID** и **Client Secret**

---

### Шаги настройки

## Шаг 7: Настройка Telegram Login (опционально)

1. Создайте бота в [@BotFather](https://t.me/botfather)
2. Получите токен бота
3. Настройте **Telegram Login Widget** на вашем домене
4. Для интеграции требуется кастомная Cloud Function

Пример Cloud Function для верификации Telegram:

```typescript
// functions/verifyTelegram.js
const functions = require('firebase-functions');
const crypto = require('crypto');

exports.verifyTelegram = functions.https.onCall(async (data, context) => {
  const { authData } = data;
  const botToken = functions.config().telegram.bot_token;
  
  // Проверка хеша
  const checkHash = authData.hash;
  delete authData.hash;
  
  const dataCheckString = Object.keys(authData)
    .sort()
    .map(key => `${key}=${authData[key]}`)
    .join('\n');
  
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  if (hash !== checkHash) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid hash');
  }
  
  return { valid: true, userId: authData.id };
});
```

---

## Шаг 8: Тестирование регистрации

### Проверка email/password регистрации

1. Откройте `http://localhost:5173/register`
2. Заполните форму:
   - Фамилия: Тестов
   - Имя: Тест
   - Отчество: Тестович
   - Дата рождения: 1990-01-01
   - Место работы: ООО «Тест»
   - Должность: Тестировщик
   - Email: test@example.com
   - Пароль: test123
3. Нажмите **"Зарегистрироваться"**

### Проверка в Firebase Console

1. Перейдите в **Authentication** → **Users**
2. Найдите созданного пользователя
3. Проверьте **Firestore Database** → коллекция `users`

---

## Шаг 9: Деплой на Production

### Firebase Hosting

1. Установите Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Войдите в Firebase:
```bash
firebase login
```

3. Инициализируйте проект:
```bash
firebase init hosting
```

4. Настройте `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

5. Задеплойте:
```bash
npm run build
firebase deploy
```

---

## 🔒 Безопасность

### Email Verification

После регистрации пользователь получает email для подтверждения. Для проверки статуса:

```typescript
import { sendEmailVerification } from 'firebase/auth';

// Отправка письма
await sendEmailVerification(user);

// Проверка статуса
const isVerified = user.emailVerified;
```

### Password Requirements

Минимальные требования к паролю:
- Минимум 6 символов
- Рекомендуется: цифры + спецсимволы

### Rate Limiting

Firebase автоматически ограничивает количество попыток входа.

---

## 📊 Мониторинг

### Firebase Analytics

Включите Analytics для отслеживания:
- Количество регистраций
- Количество входов
- Активные пользователи

### Firebase Crashlytics

Для отслеживания ошибок в production.

---

## 🆘 Troubleshooting

### Ошибка: "auth/operation-not-allowed"

**Решение:** Включите метод входа в Firebase Console → Authentication → Sign-in method

### Ошибка: "auth/email-already-in-use"

**Решение:** Пользователь с таким email уже существует. Предложите вход.

### Ошибка: "auth/invalid-email"

**Решение:** Проверьте формат email (должен содержать @ и домен)

### OAuth не работает

**Проверьте:**
1. Redirect URI совпадает в Firebase и у провайдера
2. Domain verified в Firebase Console
3. HTTPS используется (требуется для OAuth)

---

## 📚 Дополнительные ресурсы

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Apple Sign In Guide](https://firebase.google.com/docs/auth/ios/apple)
- [Yandex OAuth Documentation](https://yandex.ru/dev/oauth/)

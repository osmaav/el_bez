/**
 * Страница тестирования Firebase
 * Временный интерфейс для отладки подключения
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Loader2, Database, Shield, Key, User } from 'lucide-react';
import { app, auth, db, isFirebaseReady } from '@/lib/firebase';
import { registerUser, validateRegisterData } from '@/services/authService';
import type { RegisterUserData } from '@/types/auth';
import { EnvDebug } from './EnvDebug';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export function FirebaseTestPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const ready = isFirebaseReady();
  
  const testEmail = `test_${Date.now()}@example.com`;
  const testFormData: RegisterUserData = {
    surname: 'Тестов',
    name: 'Тест',
    patronymic: 'Тестович',
    birthDate: '1990-01-01',
    workplace: 'ООО «Тест»',
    position: 'Тестировщик',
    email: testEmail,
    password: 'test123'
  };

  const addLog = (type: LogEntry['type'], message: string, details?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString('ru-RU'),
      type,
      message,
      details
    };
    setLogs(prev => [...prev, entry]);
    console.log(`[${type.toUpperCase()}] ${message}`, details || '');
  };

  const testFirebaseConfig = async () => {
    setIsTesting(true);
    setLogs([]);
    setTestResults({});

    addLog('info', '🚀 Начало тестирования Firebase...', {
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    // Тест 1: Проверка готовности Firebase
    addLog('info', '📋 Тест 1: Проверка конфигурации Firebase...');
    const ready = isFirebaseReady();
    
    if (ready) {
      addLog('success', '✅ Firebase конфигурирован', {
        apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY?.substring(0, 10) + '...',
        authDomain: import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.REACT_APP_FIREBASE_PROJECT_ID
      });
      setTestResults(prev => ({ ...prev, config: true }));
    } else {
      addLog('error', '❌ Firebase не конфигурирован', {
        apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY || 'не установлен',
        authDomain: import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'не установлен'
      });
      setTestResults(prev => ({ ...prev, config: false }));
    }

    // Тест 2: Проверка Firebase App
    addLog('info', '📋 Тест 2: Проверка Firebase App...');
    try {
      const appName = app.name;
      const appOptions = app.options;
      addLog('success', '✅ Firebase App инициализирован', {
        name: appName,
        options: {
          apiKey: appOptions.apiKey?.substring(0, 10) + '...',
          authDomain: appOptions.authDomain,
          projectId: appOptions.projectId
        }
      });
      setTestResults(prev => ({ ...prev, app: true }));
    } catch (error: any) {
      addLog('error', '❌ Ошибка Firebase App', { error: error.message });
      setTestResults(prev => ({ ...prev, app: false }));
    }

    // Тест 3: Проверка Firebase Auth
    addLog('info', '📋 Тест 3: Проверка Firebase Auth...');
    try {
      const authReady = auth !== null && auth !== undefined;
      const currentUser = auth.currentUser;
      addLog('success', '✅ Firebase Auth готов', {
        authReady,
        currentUser: currentUser ? {
          uid: currentUser.uid,
          email: currentUser.email,
          emailVerified: currentUser.emailVerified
        } : null
      });
      setTestResults(prev => ({ ...prev, auth: true }));
    } catch (error: any) {
      addLog('error', '❌ Ошибка Firebase Auth', { error: error.message });
      setTestResults(prev => ({ ...prev, auth: false }));
    }

    // Тест 4: Проверка Firebase Firestore
    addLog('info', '📋 Тест 4: Проверка Firebase Firestore...');
    try {
      const dbReady = db !== null && db !== undefined;
      addLog('success', '✅ Firebase Firestore готов', {
        dbReady,
        databaseUrl: db?.app?.options?.projectId ? 
          `https://${db.app.options.projectId}.firestore.googleapis.com` : 'N/A'
      });
      setTestResults(prev => ({ ...prev, firestore: true }));
    } catch (error: any) {
      addLog('error', '❌ Ошибка Firebase Firestore', { error: error.message });
      setTestResults(prev => ({ ...prev, firestore: false }));
    }

    // Тест 5: Регистрация пользователя
    addLog('info', '📋 Тест 5: Регистрация тестового пользователя...');
    try {
      const validationErrors = validateRegisterData(testFormData);
      if (Object.keys(validationErrors).length > 0) {
        addLog('warning', '⚠️ Ошибки валидации', { errors: validationErrors });
        setTestResults(prev => ({ ...prev, register: false }));
      } else {
        addLog('info', '🔧 Данные для регистрации', {
          email: testFormData.email,
          password: '***',
          surname: testFormData.surname,
          name: testFormData.name,
          workplace: testFormData.workplace,
          position: testFormData.position
        });

        const userProfile = await registerUser(testFormData);
        addLog('success', '✅ Пользователь зарегистрирован', {
          uid: userProfile.id,
          email: userProfile.email,
          provider: userProfile.provider,
          createdAt: userProfile.createdAt
        });
        setTestResults(prev => ({ ...prev, register: true }));
      }
    } catch (error: any) {
      addLog('error', '❌ Ошибка регистрации', {
        error: error.message,
        code: error.code,
        stack: error.stack
      });
      setTestResults(prev => ({ ...prev, register: false }));
    }

    // Тест 6: Проверка localStorage
    addLog('info', '📋 Тест 6: Проверка localStorage...');
    try {
      const mockUsers = localStorage.getItem('mockUsers');
      const currentUser = localStorage.getItem('currentUser');
      addLog('success', '✅ localStorage доступен', {
        mockUsers: mockUsers ? JSON.parse(mockUsers).length + ' пользователей' : 'пусто',
        currentUser: currentUser ? 'текущий пользователь установлен' : 'нет текущего пользователя'
      });
      setTestResults(prev => ({ ...prev, localStorage: true }));
    } catch (error: any) {
      addLog('error', '❌ Ошибка localStorage', { error: error.message });
      setTestResults(prev => ({ ...prev, localStorage: false }));
    }

    addLog('info', '🏁 Тестирование завершено');
    setIsTesting(false);
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults({});
    console.clear();
  };

  const exportLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}${
        log.details ? '\n' + JSON.stringify(log.details, null, 2) : ''
      }`
    ).join('\n\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firebase-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('info', '📥 Логи экспортированы в файл');
  };

  const successCount = Object.values(testResults).filter(Boolean).length;
  const totalCount = Object.keys(testResults).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Заголовок */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🔥 Firebase Test Page</span>
              <Badge variant={ready ? 'default' : 'destructive'}>
                {ready ? 'Firebase Ready' : 'Firebase Not Configured'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <TestResult icon={Key} name="Config" passed={testResults.config} />
              <TestResult icon={Shield} name="App" passed={testResults.app} />
              <TestResult icon={User} name="Auth" passed={testResults.auth} />
              <TestResult icon={Database} name="Firestore" passed={testResults.firestore} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Успешно: {successCount}/{totalCount}
              </span>
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(successCount / (totalCount || 1)) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Кнопки управления */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button 
                onClick={testFirebaseConfig} 
                disabled={isTesting}
                className="flex-1"
              >
                {isTesting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isTesting ? 'Тестирование...' : '🧪 Запустить тесты'}
              </Button>
              <Button 
                variant="outline" 
                onClick={clearLogs}
                disabled={isTesting}
              >
                🗑️ Очистить
              </Button>
              <Button 
                variant="outline" 
                onClick={exportLogs}
                disabled={logs.length === 0}
              >
                📥 Экспорт
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Отладка переменных окружения */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <EnvDebug />
          </CardContent>
        </Card>

        {/* Логи */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Логи ({logs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] w-full rounded-md border">
              <div className="p-4 space-y-2">
                {logs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Нажмите "Запустить тесты" для начала проверки
                  </p>
                ) : (
                  logs.map((log, index) => (
                    <LogItem key={index} log={log} />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Информация об окружении */}
        <Card>
          <CardHeader>
            <CardTitle>ℹ️ Информация об окружении</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>URL:</strong> {window.location.href}
              </div>
              <div>
                <strong>Браузер:</strong> {navigator.userAgent}
              </div>
              <div>
                <strong>Node Env:</strong> {import.meta.env.MODE}
              </div>
              <div>
                <strong>Firebase Ready:</strong> {ready ? '✅' : '❌'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TestResult({ icon: IconComponent, name, passed }: { 
  icon: any,
  name: string, 
  passed?: boolean 
}) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border">
      {passed === undefined ? (
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
      ) : passed ? (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      )}
      <IconComponent className="w-5 h-5 text-slate-400" />
      <span className="font-medium">{name}</span>
    </div>
  );
}

function LogItem({ log }: { log: LogEntry }) {
  const colors = {
    info: 'bg-blue-50 text-blue-900 border-blue-200',
    success: 'bg-green-50 text-green-900 border-green-200',
    error: 'bg-red-50 text-red-900 border-red-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200'
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[log.type]}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{icons[log.type]}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono opacity-70">{log.timestamp}</span>
            <span className="text-xs font-bold uppercase">{log.type}</span>
          </div>
          <p className="font-medium">{log.message}</p>
          {log.details && (
            <pre className="mt-2 p-2 bg-black/5 rounded text-xs overflow-auto">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

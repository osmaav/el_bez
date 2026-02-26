/**
 * Компонент для отладки переменных окружения
 */
export function EnvDebug() {
  const envVars = {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  const allSet = Object.values(envVars).every(v => v && v !== '');

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">🔍 Environment Variables Debug</h2>
      
      <div className="mb-4 p-4 rounded-lg border-2 border-dashed">
        <div className="flex items-center gap-2 mb-2">
          {allSet ? (
            <span className="text-green-500 text-xl">✅</span>
          ) : (
            <span className="text-red-500 text-xl">❌</span>
          )}
          <span className="font-bold">
            {allSet ? 'Все переменные установлены' : 'Некоторые переменные не установлены'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(envVars).map(([key, value]) => (
          <div 
            key={key} 
            className={`p-3 rounded-lg border ${
              value && value !== '' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {value && value !== '' ? (
                <span className="text-green-600">✅</span>
              ) : (
                <span className="text-red-600">❌</span>
              )}
              <code className="text-sm font-mono font-bold">{key}</code>
            </div>
            <div className="ml-6 text-sm font-mono">
              {value ? (
                <span className="text-green-700">
                  {key.includes('KEY') || key.includes('SECRET') 
                    ? value.substring(0, 10) + '...' 
                    : value}
                </span>
              ) : (
                <span className="text-red-700">не установлено</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">📝 Как использовать:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Откройте консоль браузера (F12)</li>
          <li>Скопируйте объект envVars из этого компонента</li>
          <li>Вставьте в консоль для детального просмотра</li>
        </ol>
        <p className="mt-2 text-xs text-blue-600">
          💡 Совет: Нажмите F12, затем в Console введите: <code>copy({JSON.stringify(Object.fromEntries(Object.entries(envVars).map(([k, v]) => [k, v ? (k.includes('KEY') ? v.substring(0, 10) + '...' : v) : 'undefined'])))})</code>
        </p>
      </div>
    </div>
  );
}

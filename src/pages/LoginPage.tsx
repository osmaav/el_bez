/**
 * Страница входа
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { loginUser } from '@/services/authService';
import type { LoginUserData } from '@/types/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Автозаполнение из localStorage
  const [formData, setFormData] = useState<LoginUserData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('elbez_login_form');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Ошибка парсинга сохранённых данных формы:', e);
        }
      }
    }
    return {
      email: '',
      password: ''
    };
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    
    // Сохраняем в localStorage для автозаполнения (только email)
    if (name === 'email') {
      localStorage.setItem('elbez_login_form', JSON.stringify({ email: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('📝 [LoginPage] Вход пользователя:', formData.email);
      const user = await loginUser(formData);
      console.log('✅ [LoginPage] Вход успешен:', {
        email: user.email,
        emailVerified: user.emailVerified,
        provider: user.provider
      });
      
      // ⚠️ ПРОВЕРКА EMAIL ОТКЛЮЧЕНА ВРЕМЕННО
      // Выполняем вход и перенаправляем на главную
      login(user);
      console.log('⚠️ [LoginPage] Проверка email отключена, перенаправление на главную');
      navigate('/');
    } catch (err: any) {
      console.error('❌ [LoginPage] Ошибка входа:', err);
      setError(err.message || 'Ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Вход в систему
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Сообщение об ошибке */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Форма входа */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@mail.ru"
                disabled={isLoading}
                required
              />
            </div>

            {/* Пароль */}
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>

            {/* Кнопка входа */}
            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>

            {/* Ссылка на регистрацию */}
            <p className="text-center text-sm text-muted-foreground">
              Нет аккаунта?{' '}
              <a
                href="/register"
                className="text-primary hover:underline font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/register');
                }}
              >
                Зарегистрироваться
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

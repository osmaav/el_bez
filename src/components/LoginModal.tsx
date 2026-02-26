/**
 * Модальное окно входа
 */
import type { FormEvent, ChangeEvent } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginUser } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import type { LoginUserData } from '@/types/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LoginUserData>({
    email: '',
    password: ''
  });

  // Блокировка прокрутки фона при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await loginUser(formData);
      // Сохраняем пользователя в AuthContext
      login(user);
      // Перенаправление на приложение после успешного входа
      navigate('/');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Затемнение фона */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Модальное окно */}
      <Card className="relative w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          {/* Заголовок */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-slate-900 font-bold text-2xl">ЭБ</span>
            </div>
            <h2
              id="modal-title"
              className="text-2xl font-bold text-slate-900"
            >
              Вход в систему
            </h2>
          </div>

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
                className="bg-white/50"
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
                className="bg-white/50"
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
                  onClose();
                  navigate('/register');
                }}
              >
                Зарегистрироваться
              </a>
            </p>
          </form>

        </div>
      </Card>
    </div>
  );
}

/**
 * Модальное окно входа
 */
import type { FormEvent, ChangeEvent } from 'react';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginUser } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { X, Eye, EyeOff } from 'lucide-react';
import type { LoginUserData } from '@/types/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onOpenRegister }: LoginModalProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      
      // Проверка подтверждения email
      if (!user.emailVerified) {
        console.log('⚠️ [LoginModal] Email не подтверждён:', user.email);
        setError('Пожалуйста, подтвердите ваш email. Проверьте папку "Спам", если письмо не пришло.');
        setIsLoading(false);
        return;
      }
      
      console.log('✅ [LoginModal] Вход успешен, email подтверждён:', user.email);
      // Сохраняем пользователя в AuthContext
      login(user);
      // Закрываем модальное окно
      onClose();
    } catch (err: any) {
      console.error('❌ [LoginModal] Ошибка входа:', err);
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
      <Card className="relative w-full max-w-lg bg-white/95 backdrop-blur-md shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Закрыть"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 pr-14">
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

          {/* Информационный текст */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-slate-700 leading-relaxed">
              Данный ресурс был разработан для изучения вопросов электробезопасности 
              для электротехнического персонала и подготовки к сдаче экзаменов по группам.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              Для ведения вашей личной статистики рекомендуем вам создать учетную запись 
              или войти с уже существующей. Вы так же можете закрыть это окно и продолжить без входа.
            </p>
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
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                  className="bg-white/50 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
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
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
              >
                Зарегистрироваться
              </button>
            </p>
          </form>

        </div>
      </Card>
    </div>
  );
}

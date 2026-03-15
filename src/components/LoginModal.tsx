/**
 * Модальное окно входа — современный дизайн
 *
 * @description Обновлённое модальное окно входа с использованием AnimatedModal
 * @author el-bez UI Team
 * @version 2.1.0
 */

import type { FormEvent, ChangeEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { loginUser, sendPasswordResetEmailService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Eye, EyeOff, LogIn, Mail, Lock, KeyRound, ArrowLeft } from 'lucide-react';
import type { LoginUserData } from '@/types/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onOpenRegister }: LoginModalProps) {
  const { login } = useAuth();
  const { error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Состояния для формы входа
  const [formData, setFormData] = useState<LoginUserData>({
    email: '',
    password: ''
  });

  // Состояния для восстановления пароля
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // 🔒 Убрали автозаполнение из localStorage - не храним персональные данные

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await loginUser(formData);

      // Проверка подтверждения email
      if (!user || !user.emailVerified) {
        toastError('Email не подтверждён', 'Проверьте папку "Спам", если письмо не пришло.');
        setIsLoading(false);
        return;
      }

      // 🔒 Убрали сохранение email в localStorage - не храним персональные данные

      // Сохраняем пользователя в AuthContext
      login(user);

      // Закрываем модальное окно
      onClose();
    } catch (err: unknown) {
      // Полная отладка ошибки
      const errorObj = err as { message?: string; code?: string };
      console.error('❌ [LoginModal] Ошибка входа:', {
        message: errorObj.message,
        code: errorObj.code,
        fullError: JSON.stringify(err, null, 2)
      });

      // Получаем сообщение об ошибке
      let errorMessage = 'Ошибка при входе';

      if (errorObj.message) {
        errorMessage = errorObj.message;
      } else if (errorObj.code) {
        // Обработка кодов ошибок Firebase
        switch (errorObj.code) {
          case 'auth/user-not-found':
          case 'EMAIL_NOT_FOUND':
            errorMessage = 'Пользователь не найден';
            break;
          case 'auth/wrong-password':
          case 'INVALID_PASSWORD':
            errorMessage = 'Неверный пароль';
            break;
          case 'auth/invalid-email':
          case 'INVALID_EMAIL':
            errorMessage = 'Неверный формат email';
            break;
          case 'auth/user-disabled':
          case 'USER_DISABLED':
            errorMessage = 'Аккаунт отключён';
            break;
          default:
            errorMessage = errorObj.code || 'Ошибка при входе';
        }
      }

      toastError('Ошибка входа', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Отправка запроса на сброс пароля
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setResetSuccess(null);
    setResetLoading(true);

    try {
      // Реальная отправка письма через Firebase
      await sendPasswordResetEmailService(resetEmail);

      setResetSuccess(`Письмо с инструкциями отправлено на ${resetEmail}`);
      setResetSent(true);

      // Очищаем форму через 5 секунд
      setTimeout(() => {
        setShowResetForm(false);
        setResetSent(false);
        setResetEmail('');
        setResetSuccess(null);
      }, 5000);
    } catch (err: unknown) {
      toastError('Ошибка', err instanceof Error ? err.message : 'Не удалось отправить письмо');
    } finally {
      setResetLoading(false);
    }
  };

  // Возврат к форме входа
  const handleBackToLogin = () => {
    setShowResetForm(false);
    setResetEmail('');
    setResetSent(false);
    setResetSuccess(null);
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      animation="scale"
      size="md"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {!showResetForm ? (
          <>
            {/* Заголовок с иконкой */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                <LogIn className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                С возвращением!
              </h2>
              <p className="text-sm text-slate-600">
                Войдите для доступа к статистике
              </p>
            </div>

            {/* Форма входа */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@mail.ru"
                    disabled={isLoading}
                    required
                    className="pl-10 bg-white/50 text-slate-600"
                  />
                </div>
              </div>

              {/* Пароль */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Пароль
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                    className="pl-10 pr-10 bg-white/50 text-slate-600"
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
                {/* Ссылка на восстановление пароля */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all"
                    onClick={() => {
                      setShowResetForm(true);
                      setResetEmail(formData.email);
                    }}
                  >
                    Забыли пароль?
                  </button>
                </div>
              </div>

              {/* Кнопка входа */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Вход...
                  </span>
                ) : (
                  'Войти'
                )}
              </Button>

              {/* Ссылка на регистрацию */}
              <p className="text-center text-sm text-slate-600">
                Нет аккаунта?{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
                  onClick={() => {
                    onClose();
                    onOpenRegister();
                  }}
                >
                  Зарегистрироваться
                </button>
              </p>
            </form>

            {/* Разделитель */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">
                  Или продолжите без входа
                </span>
              </div>
            </div>

            {/* Кнопка продолжения без входа */}
            <Button
              variant="outline"
              className="w-full text-slate-500 focus-visible:border-slate-400"
              onClick={onClose}
            >
              Продолжить без регистрации
            </Button>
          </>
        ) : (
          <>
            {/* Форма восстановления пароля */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <KeyRound className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Восстановление пароля
              </h2>
              <p className="text-sm text-slate-600">
                Введите email для сброса пароля
              </p>
            </div>

            {/* Сообщение об успехе */}
            {resetSuccess && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-sm text-emerald-800 text-center">
                  {resetSuccess}
                </p>
              </div>
            )}

            {/* Форма сброса пароля */}
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="reset-email"
                    name="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="example@mail.ru"
                    disabled={resetLoading || resetSent}
                    required
                    className="pl-10 bg-white/50 text-slate-600"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  На этот email будет отправлена инструкция по сбросу пароля
                </p>
              </div>

              {/* Кнопка отправки */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25"
                disabled={resetLoading || resetSent}
              >
                {resetLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Отправка...
                  </span>
                ) : resetSent ? (
                  'Письмо отправлено'
                ) : (
                  'Отправить инструкцию'
                )}
              </Button>

              {/* Кнопка возврата */}
              <Button
                type="button"
                variant="outline"
                className="w-full text-slate-700"
                onClick={handleBackToLogin}
                disabled={resetLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Вернуться ко входу
              </Button>
            </form>
          </>
        )}
      </div>
    </AnimatedModal>
  );
}

export default LoginModal;

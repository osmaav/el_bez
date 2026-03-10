/**
 * Модальное окно регистрации — современный дизайн
 *
 * @description Обновлённое модальное окно регистрации с использованием AnimatedModal
 * @author el-bez UI Team
 * @version 2.0.0
 */

import type { FormEvent, ChangeEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { registerUser, validateRegisterData, checkEmailExists } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Calendar, Building, Briefcase } from 'lucide-react';
import type { RegisterUserData, ValidationErrors } from '@/types/auth';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export function RegisterModal({ isOpen, onClose, onOpenLogin }: RegisterModalProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Состояния для проверки email
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Состояния для отображения пароля
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<RegisterUserData>({
    surname: '',
    name: '',
    patronymic: '',
    birthDate: '',
    workplace: '',
    position: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    // 🔒 Убрали сохранение в localStorage - не храним персональные данные
    // Очищаем ошибку при изменении поля
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Сбрасываем статус существования email при изменении поля email
    if (name === 'email') {
      setEmailExists(false);
      setEmailTouched(false);
    }
  };

  // Проверка email на существование
  const checkEmail = async (email: string) => {
    if (!email || validationErrors.email) {
      return;
    }

    setIsCheckingEmail(true);
    try {
      const exists = await checkEmailExists(email);
      setEmailExists(exists);
    } catch (err) {
      console.error('Ошибка проверки email:', err);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Обработчик onBlur для проверки email
  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmailTouched(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      checkEmail(email);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // Валидация
    const errors = validateRegisterData(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Дополнительная проверка: если email существует, блокируем регистрацию
    if (emailExists) {
      setError('Этот email уже зарегистрирован. Пожалуйста, войдите или используйте другой email.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await registerUser(formData);

      // Автоматический вход после регистрации
      login(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      animation="scale"
      size="lg"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Заголовок с иконкой */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Создание аккаунта
          </h2>
          <p className="text-sm text-slate-600">
            Заполните форму для регистрации
          </p>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Форма регистрации */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Имя и Фамилия */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surname" className="text-sm font-medium text-slate-700">
                Фамилия *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  placeholder="Иванов"
                  disabled={isLoading}
                  className="pl-10 bg-white/50 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-0"
                />
              </div>
              {validationErrors.surname && (
                <p className="text-xs text-red-500">{validationErrors.surname}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                Имя *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Иван"
                  disabled={isLoading}
                  className="pl-10 bg-white/50 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-0"
                />
              </div>
              {validationErrors.name && (
                <p className="text-xs text-red-500">{validationErrors.name}</p>
              )}
            </div>
          </div>

          {/* Отчество */}
          <div className="space-y-2">
            <Label htmlFor="patronymic" className="text-sm font-medium text-slate-700">
              Отчество
            </Label>
            <Input
              id="patronymic"
              name="patronymic"
              value={formData.patronymic}
              onChange={handleInputChange}
              placeholder="Иванович"
              disabled={isLoading}
              className="bg-white/50 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-0"
            />
            {validationErrors.patronymic && (
              <p className="text-xs text-red-500">{validationErrors.patronymic}</p>
            )}
          </div>

          {/* Дата рождения */}
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-sm font-medium text-slate-700">
              Дата рождения *
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange}
                disabled={isLoading}
                className="pl-10 bg-white/50 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-0 [&::-webkit-calendar-picker-indicator]:text-slate-400 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
            {validationErrors.birthDate && (
              <p className="text-xs text-red-500">{validationErrors.birthDate}</p>
            )}
          </div>

          {/* Место работы и Должность */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workplace" className="text-sm font-medium text-slate-700">
                Место работы *
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="workplace"
                  name="workplace"
                  value={formData.workplace}
                  onChange={handleInputChange}
                  placeholder="ООО «Феорана-СБ»"
                  disabled={isLoading}
                  className="pl-10 bg-white/50 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-0"
                />
              </div>
              {validationErrors.workplace && (
                <p className="text-xs text-red-500">{validationErrors.workplace}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium text-slate-700">
                Должность *
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="Инженер"
                  disabled={isLoading}
                  className="pl-10 bg-white/50 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-0"
                />
              </div>
              {validationErrors.position && (
                <p className="text-xs text-red-500">{validationErrors.position}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleEmailBlur}
                placeholder="example@mail.ru"
                disabled={isLoading || isCheckingEmail}
                className={`pl-10 bg-white/50 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-0 ${emailExists && emailTouched ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {isCheckingEmail && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {validationErrors.email && (
              <p className="text-xs text-red-500">{validationErrors.email}</p>
            )}
            {emailExists && emailTouched && (
              <p className="text-xs text-red-500">
                Этот email уже зарегистрирован.{' '}
                <button
                  type="button"
                  className="underline hover:text-blue-600 font-medium"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                >
                  Войти
                </button>
                ?
              </p>
            )}
          </div>

          {/* Пароль */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Пароль *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Минимум 6 символов"
                disabled={isLoading}
                className="pl-10 pr-10 bg-white/50 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-0"
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
            {validationErrors.password && (
              <p className="text-xs text-red-500">{validationErrors.password}</p>
            )}
          </div>

          {/* Кнопка регистрации */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25"
            disabled={isLoading || emailExists}
            title={emailExists ? 'Email уже зарегистрирован' : ''}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Регистрация...
              </span>
            ) : emailExists ? (
              'Email уже зарегистрирован'
            ) : (
              'Зарегистрироваться'
            )}
          </Button>

          {/* Ссылка на вход */}
          <p className="text-center text-sm text-slate-600">
            Уже есть аккаунт?{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
            >
              Войти
            </button>
          </p>
        </form>
      </div>
    </AnimatedModal>
  );
}

export default RegisterModal;

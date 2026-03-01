/**
 * Модальное окно регистрации
 */
import type { FormEvent, ChangeEvent } from 'react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { registerUser, validateRegisterData, checkEmailExists } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { X, Eye, EyeOff } from 'lucide-react';
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

  // Блокировка прокрутки фона при открытом модальном окне
  useState(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    // Сохраняем в localStorage для автозаполнения (кроме пароля)
    if (name !== 'password') {
      localStorage.setItem('elbez_register_form', JSON.stringify(updatedData));
    }

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
      console.log('📧 [RegisterModal] Проверка email:', { email, exists });
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

    // Проверяем email только если он валидный
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
      console.log('📝 [RegisterModal] Регистрация пользователя:', formData.email);
      const user = await registerUser(formData);
      console.log('✅ [RegisterModal] Регистрация успешна:', {
        email: user.email,
        emailVerified: user.emailVerified,
        provider: user.provider
      });

      // Автоматический вход после регистрации
      login(user);

      // Закрываем модальное окно
      onClose();
    } catch (err: any) {
      console.error('❌ [RegisterModal] Ошибка регистрации:', err);
      setError(err.message || 'Ошибка при регистрации');
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
              Регистрация пользователя
            </h2>
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Форма регистрации */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Имя и Фамилия */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="surname">Фамилия *</Label>
                <Input
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  placeholder="Иванов"
                  disabled={isLoading}
                />
                {validationErrors.surname && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.surname}</p>
                )}
              </div>
              <div>
                <Label htmlFor="name">Имя *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Иван"
                  disabled={isLoading}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
                )}
              </div>
            </div>

            {/* Отчество */}
            <div>
              <Label htmlFor="patronymic">Отчество</Label>
              <Input
                id="patronymic"
                name="patronymic"
                value={formData.patronymic}
                onChange={handleInputChange}
                placeholder="Иванович"
                disabled={isLoading}
              />
              {validationErrors.patronymic && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.patronymic}</p>
              )}
            </div>

            {/* Дата рождения */}
            <div>
              <Label htmlFor="birthDate">Дата рождения *</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {validationErrors.birthDate && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.birthDate}</p>
              )}
            </div>

            {/* Место работы и Должность */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workplace">Место работы *</Label>
                <Input
                  id="workplace"
                  name="workplace"
                  value={formData.workplace}
                  onChange={handleInputChange}
                  placeholder="ООО «Феорана-СБ»"
                  disabled={isLoading}
                />
                {validationErrors.workplace && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.workplace}</p>
                )}
              </div>
              <div>
                <Label htmlFor="position">Должность *</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="Инженер"
                  disabled={isLoading}
                />
                {validationErrors.position && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.position}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleEmailBlur}
                  placeholder="example@sb.feorana.ru"
                  disabled={isLoading || isCheckingEmail}
                  className={emailExists && emailTouched ? 'border-red-500 focus:border-red-500' : ''}
                />
                {isCheckingEmail && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {validationErrors.email && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
              )}
              {emailExists && emailTouched && (
                <p className="text-sm text-red-500 mt-1">
                  Этот email уже зарегистрирован.{' '}
                  <button
                    type="button"
                    className="underline hover:text-blue-600"
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
            <div>
              <Label htmlFor="password">Пароль *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Минимум 6 символов"
                  disabled={isLoading}
                  className="pr-10"
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
                <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Кнопка регистрации */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || emailExists}
              title={emailExists ? 'Email уже зарегистрирован' : ''}
            >
              {isLoading ? 'Регистрация...' : emailExists ? 'Email уже зарегистрирован' : 'Зарегистрироваться'}
            </Button>

            {/* Ссылка на вход */}
            <p className="text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
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
      </Card>
    </div>
  );
}

/**
 * Компонент формы регистрации
 */
import type { FormEvent, ChangeEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { registerUser, signInWithOAuth, validateRegisterData } from '@/services/authService';
import type { RegisterUserData, ValidationErrors } from '@/types/auth';
import { Apple, Mail } from 'lucide-react';

export function RegisterForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

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
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку при изменении поля
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
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

    setIsLoading(true);

    try {
      await registerUser(formData);
      // Перенаправление на страницу входа с сообщением об успехе
      navigate('/login', { 
        state: { 
          message: 'Регистрация успешна! Проверьте email для подтверждения.' 
        } 
      });
    } catch (err: any) {
      setError(err.message || 'Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'apple' | 'yandex') => {
    setError(null);
    setIsLoading(true);

    try {
      await signInWithOAuth(provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка при входе через OAuth');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Регистрация пользователя
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* OAuth кнопки */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn('apple')}
            disabled={isLoading}
          >
            <Apple className="w-5 h-5 mr-2" />
            Через Apple
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn('yandex')}
            disabled={isLoading}
          >
            <Mail className="w-5 h-5 mr-2" />
            Через Яндекс
          </Button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Или зарегистрируйтесь через email
            </span>
          </div>
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
                placeholder="ООО «Ромашка»"
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
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@mail.ru"
              disabled={isLoading}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Пароль */}
          <div>
            <Label htmlFor="password">Пароль *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Минимум 6 символов"
              disabled={isLoading}
            />
            {validationErrors.password && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Кнопка регистрации */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>

          {/* Ссылка на вход */}
          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <a href="/login" className="text-primary hover:underline">
              Войти
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

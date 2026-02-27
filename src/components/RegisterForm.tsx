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
import { registerUser, validateRegisterData } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import type { RegisterUserData, ValidationErrors } from '@/types/auth';

export function RegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Автозаполнение из localStorage
  const [formData, setFormData] = useState<RegisterUserData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('elbez_register_form');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // console.error('Ошибка парсинга сохранённых данных формы:', e);
        }
      }
    }
    return {
      surname: '',
      name: '',
      patronymic: '',
      birthDate: '',
      workplace: '',
      position: '',
      email: '',
      password: ''
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
      // console.log('📝 [RegisterForm] Регистрация пользователя:', formData.email);
      const user = await registerUser(formData);
      // console.log('✅ [RegisterForm] Регистрация успешна:', {
      //   email: user.email,
      //   emailVerified: user.emailVerified,
      //   provider: user.provider
      // });

      // Автоматический вход после регистрации
      login(user);

      // ⚠️ ПРОВЕРКА EMAIL ОТКЛЮЧЕНА ВРЕМЕННО
      // Перенаправляем на главную сразу после регистрации
      // console.log('⚠️ [RegisterForm] Проверка email отключена, перенаправление на главную');
      navigate('/');
    } catch (err: any) {
      // console.error('❌ [RegisterForm] Ошибка регистрации:', err);
      setError(err.message || 'Ошибка при регистрации');
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
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@sb.feorana.ru"
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

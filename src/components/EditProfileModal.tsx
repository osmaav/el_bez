/**
 * Модальное окно редактирования профиля пользователя
 * 
 * @description Позволяет изменить данные пользователя: ФИО, email, место работы, должность
 * @author el-bez UI Team
 * @version 1.0.0
 */

import type { FormEvent, ChangeEvent } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedModal } from '@/components/ui/animated-modal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { updateUserProfileData, updateUserName } from '@/services/profileService';
import { User, Mail, Building, Briefcase, Save, X } from 'lucide-react';
import type { UserProfile } from '@/types/auth';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useAuth();
  const { success, error: toastError, loading, updateToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    surname: '',
    name: '',
    patronymic: '',
    email: '',
    workplace: '',
    position: ''
  });

  // Загрузка данных пользователя при открытии
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        surname: user.surname || '',
        name: user.name || '',
        patronymic: user.patronymic || '',
        email: user.email || '',
        workplace: user.workplace || '',
        position: user.position || ''
      });
    }
  }, [user, isOpen]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toastError('Ошибка', 'Пользователь не авторизован');
      return;
    }

    setIsLoading(true);
    const loadingId = loading('Сохранение', 'Обновление данных профиля...');

    try {
      // Обновление имени в Firebase Auth
      const fullName = `${formData.surname} ${formData.name}`.trim();
      if (user.name !== fullName) {
        await updateUserName(user.id, fullName);
      }

      // Обновление данных в Firestore
      const profileData: Partial<UserProfile> = {
        surname: formData.surname,
        name: formData.name,
        patronymic: formData.patronymic,
        workplace: formData.workplace,
        position: formData.position,
        email: formData.email
      };

      await updateUserProfileData(user.id, profileData);

      // Обновление пользователя в контексте
      updateUser({
        ...user,
        ...profileData
      });

      updateToast(loadingId, { type: 'success', title: 'Профиль обновлён' });
      success('Профиль обновлён', 'Данные успешно сохранены');
      onClose();
    } catch (err: unknown) {
      console.error('❌ [EditProfileModal] Ошибка сохранения профиля:', err);
      updateToast(loadingId, { type: 'error', title: 'Ошибка сохранения' });
      toastError('Ошибка сохранения', err instanceof Error ? err.message : 'Не удалось обновить профиль');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Редактирование профиля
          </h2>
          <p className="text-sm text-slate-600">
            Измените ваши личные данные
          </p>
        </div>

        {/* Форма редактирования */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Фамилия и Имя */}
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
                  required
                  className="pl-10 bg-white/50 text-slate-600"
                />
              </div>
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
                  required
                  className="pl-10 bg-white/50 text-slate-600"
                />
              </div>
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
              className="bg-white/50 text-slate-600"
            />
          </div>

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
                className="pl-10 bg-white/50 text-slate-600"
              />
            </div>
          </div>

          {/* Место работы и Должность */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workplace" className="text-sm font-medium text-slate-700">
                Место работы
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
                  className="pl-10 bg-white/50 text-slate-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium text-slate-700">
                Должность
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
                  className="pl-10 bg-white/50 text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 text-slate-700"
            >
              <X className="h-4 w-4 mr-2" />
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Сохранение...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}

export default EditProfileModal;

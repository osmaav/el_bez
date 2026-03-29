/**
 * User Entity - Типы для пользователя
 *
 * @description Сущность пользователя и профиля
 * @author el-bez Team
 * @version 1.0.0
 */

/**
 * Базовый тип пользователя
 */
export interface User {
  uid?: string;
  id?: string;
  email: string;
  name?: string;
  surname?: string;
  patronymic?: string;
  workplace?: string;
  position?: string;
  photoURL?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Профиль пользователя
 */
export interface UserProfile extends User {
  id: string;
  email: string;
}

/**
 * Данные для регистрации
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  surname?: string;
  patronymic?: string;
  workplace?: string;
  position?: string;
}

/**
 * Данные для входа
 */
export interface LoginData {
  email: string;
  password: string;
}

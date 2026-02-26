/**
 * Страница регистрации
 */
import { RegisterForm } from '@/components/RegisterForm';

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}

/**
 * Модальное окно подтверждения email
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  onVerify: () => Promise<void>;
  onResend: () => Promise<void>;
  onLogout: () => void;
  onVerified?: () => void; // Колбэк при успешном подтверждении
}

export function EmailVerificationModal({
  isOpen,
  email,
  onVerify,
  onResend,
  onLogout,
  onVerified
}: EmailVerificationModalProps) {
  const { isEmailVerified } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

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

  // Таймер обратного отсчёта для кнопки повторной отправки
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Отслеживаем изменение статуса подтверждения email
  useEffect(() => {
    if (isEmailVerified && !isVerified) {
      // console.log('✅ [EmailVerificationModal] Email подтверждён!');
      setIsVerified(true);
      // Вызываем колбэк успешного подтверждения
      if (onVerified) {
        onVerified();
      }
    }
  }, [isEmailVerified, isVerified, onVerified]);

  // Убрали автоматическую проверку - теперь только по клику пользователя
  // Это снижает нагрузку на сервер и базу данных

  const handleCheck = async () => {
    // console.log('🔍 [EmailVerificationModal] Проверка email по клику пользователя');
    setIsChecking(true);
    try {
      await onVerify();
      // Проверяем статус через useAuth (checkEmail обновил контекст)
      // localStorage больше не содержит персональных данных
      // console.log('✅ [EmailVerificationModal] Проверка выполнена');
    } catch (error) {
      // console.error('❌ [EmailVerificationModal] Ошибка проверки email:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;

    // console.log('📧 [EmailVerificationModal] Запрос повторной отправки письма');
    setIsResending(true);
    try {
      await onResend();
      setResendCountdown(60); // 60 секунд между отправками
      // console.log('✅ [EmailVerificationModal] Письмо отправлено, таймер 60 сек');
    } catch (error) {
      // console.error('❌ [EmailVerificationModal] Ошибка отправки письма:', error);
    } finally {
      setIsResending(false);
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
          {/* Иконка */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {isVerified ? (
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            ) : (
              <Mail className="w-8 h-8 text-blue-600" />
            )}
          </div>

          {/* Заголовок */}
          <div className="text-center mb-4">
            <h2
              id="modal-title"
              className="text-2xl font-bold text-slate-900 mb-2"
            >
              {isVerified
                ? 'Email подтверждён!'
                : 'Подтвердите ваш email'}
            </h2>
            <p className="text-slate-600">
              {isVerified
                ? 'Ваш email успешно подтверждён'
                : `Мы отправили письмо подтверждения на ${email}`}
            </p>
          </div>

          {/* Сообщение об успехе */}
          {isVerified ? (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <AlertTitle className="text-green-800">Успешно!</AlertTitle>
              <AlertDescription className="text-green-700">
                Ваш email подтверждён. Теперь вы можете пользоваться всеми функциями приложения.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Инструкция */}
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <AlertTitle className="text-blue-800">Что делать?</AlertTitle>
                <AlertDescription className="text-blue-700">
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Откройте ваш почтовый ящик</li>
                    <li>Найдите письмо от noreply@el-bez-before-1000v.firebaseapp.com</li>
                    <li>Нажмите на ссылку подтверждения в письме</li>
                    <li>Вернитесь в приложение и нажмите "Проверить"</li>
                  </ol>
                </AlertDescription>
              </Alert>

              {/* Не приходит письмо? */}
              <div className="mb-4 text-sm text-slate-600">
                <p className="font-medium mb-2">Не пришло письмо?</p>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  <li>Проверьте папку "Спам"</li>
                  <li>Убедитесь, что email указан верно</li>
                  <li>Запросите повторную отправку</li>
                </ul>
              </div>
            </>
          )}

          {/* Кнопки действий */}
          <div className="space-y-3">
            {!isVerified ? (
              <>
                <Button
                  onClick={handleCheck}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Проверка...
                    </>
                  ) : (
                    'Проверить подтверждение'
                  )}
                </Button>

                <Button
                  onClick={handleResend}
                  variant="outline"
                  className="w-full"
                  disabled={isResending || resendCountdown > 0}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : resendCountdown > 0 ? (
                    `Отправить через ${resendCountdown} сек`
                  ) : (
                    'Отправить письмо повторно'
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={onLogout}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                Продолжить работу
              </Button>
            )}

            {!isVerified && (
              <Button
                onClick={onLogout}
                variant="ghost"
                className="w-full text-slate-600 hover:text-slate-900"
              >
                Выйти из системы
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

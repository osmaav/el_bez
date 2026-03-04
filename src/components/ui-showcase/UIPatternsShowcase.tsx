/**
 * UIPatternsShowcase — демонстрация всех UI-паттернов
 * 
 * @description Страница для демонстрации и тестирования всех созданных компонентов
 * @author el-bez UI Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { PageTransition } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ToastContainer } from '@/components/ui/toast-message';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { SuccessModal } from '@/components/ui/success-modal';
import { LoadingModal } from '@/components/ui/loading-modal';
import { BottomSheet, BottomSheetItem, BottomSheetHeader } from '@/components/ui/bottom-sheet';
import { RichTooltip, QuickTooltip } from '@/components/ui/rich-tooltip';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Sparkles,
  Trophy,
  Upload,
  Download,
  Save,
  RefreshCw,
  Share2,
  Edit3,
  Trash2,
  Copy,
  MoreVertical,
  Settings,
  HelpCircle,
  Lightbulb,
  Zap,
  Star,
  Heart,
  MessageSquare,
} from 'lucide-react';

export function UIPatternsShowcase() {
  const { toasts, removeToast, success, error, warning, info, loading } = useToast(5);

  // Состояния модальных окон
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'default' | 'danger' | 'warning' | 'info';
  }>({ isOpen: false, type: 'default' });

  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    icon: 'check' | 'sparkles' | 'trophy' | 'star' | 'award';
  }>({ isOpen: false, icon: 'check' });

  const [loadingModal, setLoadingModal] = useState<{
    isOpen: boolean;
    type: 'default' | 'upload' | 'download' | 'save' | 'sync';
    status: 'loading' | 'success' | 'error';
    progress: number;
  }>({ isOpen: false, type: 'default', status: 'loading', progress: 0 });

  const [bottomSheet, setBottomSheet] = useState(false);

  // Демонстрация ConfirmModal
  const showConfirmModal = (type: 'default' | 'danger' | 'warning' | 'info') => {
    setConfirmModal({ isOpen: true, type });
  };

  // Демонстрация SuccessModal
  const showSuccessModal = (icon: 'check' | 'sparkles' | 'trophy' | 'star' | 'award') => {
    setSuccessModal({ isOpen: true, icon });
  };

  // Демонстрация LoadingModal
  const showLoadingModal = (type: 'default' | 'upload' | 'download' | 'save' | 'sync') => {
    setLoadingModal({ isOpen: true, type, status: 'loading', progress: 0 });

    // Симуляция прогресса
    const interval = setInterval(() => {
      setLoadingModal((prev) => {
        const newProgress = prev.progress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return { ...prev, progress: 100, status: 'success' };
        }
        return { ...prev, progress: newProgress };
      });
    }, 300);
  };

  return (
    <PageTransition animation="fade-up" duration={0.5}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50">
        {/* Заголовок страницы */}
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  UI Паттерны
                </h1>
                <p className="mt-1 text-slate-600">
                  Демонстрация современных компонентов интерфейса
                </p>
              </div>
              <Badge variant="secondary" className="text-sm">
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Toast уведомления */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Toast Уведомления
              </h2>
            </div>
            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle>Система уведомлений</CardTitle>
                <CardDescription>
                  Нажмите на кнопку, чтобы показать уведомление разных типов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => success('Успешно!', 'Действие выполнено успешно')}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Success
                  </Button>
                  <Button
                    onClick={() => error('Ошибка!', 'Что-то пошло не так')}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Error
                  </Button>
                  <Button
                    onClick={() => warning('Внимание!', 'Требуется ваше подтверждение')}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Warning
                  </Button>
                  <Button
                    onClick={() => info('Информация', 'Полезная информация для вас')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Info
                  </Button>
                  <Button
                    onClick={() => loading('Загрузка', 'Пожалуйста, подождите...')}
                    variant="outline"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Loading
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Confirm Modal */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Модальные окна подтверждения
              </h2>
            </div>
            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle>ConfirmModal</CardTitle>
                <CardDescription>
                  Модальные окна для подтверждения действий с разными типами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => showConfirmModal('default')}
                    variant="outline"
                  >
                    Default
                  </Button>
                  <Button
                    onClick={() => showConfirmModal('info')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Info
                  </Button>
                  <Button
                    onClick={() => showConfirmModal('warning')}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Warning
                  </Button>
                  <Button
                    onClick={() => showConfirmModal('danger')}
                    variant="destructive"
                  >
                    Danger
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Success Modal */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Модальные окна успеха
              </h2>
            </div>
            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle>SuccessModal</CardTitle>
                <CardDescription>
                  Красивые уведомления об успешном завершении
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => showSuccessModal('check')}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check
                  </Button>
                  <Button
                    onClick={() => showSuccessModal('sparkles')}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Sparkles
                  </Button>
                  <Button
                    onClick={() => showSuccessModal('trophy')}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Trophy
                  </Button>
                  <Button
                    onClick={() => showSuccessModal('star')}
                    variant="outline"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Star
                  </Button>
                  <Button
                    onClick={() => showSuccessModal('award')}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Award
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Loading Modal */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Модальные окна загрузки
              </h2>
            </div>
            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle>LoadingModal</CardTitle>
                <CardDescription>
                  Отслеживание прогресса операций с анимациями
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => showLoadingModal('default')}
                    variant="outline"
                  >
                    Default
                  </Button>
                  <Button
                    onClick={() => showLoadingModal('upload')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <Button
                    onClick={() => showLoadingModal('download')}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => showLoadingModal('save')}
                    variant="secondary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={() => showLoadingModal('sync')}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Bottom Sheet */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MoreVertical className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Нижняя панель (Bottom Sheet)
              </h2>
            </div>
            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle>BottomSheet</CardTitle>
                <CardDescription>
                  Выезжающая панель для мобильных устройств
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setBottomSheet(true)}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  <MoreVertical className="h-4 w-4 mr-2" />
                  Открыть Bottom Sheet
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Rich Tooltip */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Богатые подсказки
              </h2>
            </div>
            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle>RichTooltip & QuickTooltip</CardTitle>
                <CardDescription>
                  Подсказки с богатым контентом и стилями
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <RichTooltip
                    type="info"
                    title="Подсказка"
                    content="Это информационная подсказка с подробным описанием"
                    position="top"
                    action={{
                      label: 'Узнать больше',
                      onClick: () => console.log('Learn more'),
                    }}
                  >
                    <Button variant="outline">
                      <Info className="h-4 w-4 mr-2" />
                      Info Tooltip
                    </Button>
                  </RichTooltip>

                  <RichTooltip
                    type="warning"
                    title="Внимание"
                    content="Это действие может повлиять на другие данные"
                    position="top"
                  >
                    <Button variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-50">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Warning
                    </Button>
                  </RichTooltip>

                  <RichTooltip
                    type="tip"
                    title="💡 Совет"
                    content="Используйте Ctrl+S для быстрого сохранения"
                    position="top"
                  >
                    <Button variant="outline" className="border-violet-500 text-violet-700 hover:bg-violet-50">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Tip
                    </Button>
                  </RichTooltip>

                  <QuickTooltip content="Простая подсказка с текстом">
                    <Button variant="outline">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Quick Tooltip
                    </Button>
                  </QuickTooltip>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Модальные окна */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1000))}
          title="Подтверждение действия"
          description="Вы уверены, что хотите продолжить? Это действие может повлиять на другие данные."
          type={confirmModal.type}
          confirmLabel="Продолжить"
          cancelLabel="Отмена"
        />

        <SuccessModal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
          title="Поздравляем!"
          description="Вы успешно завершили тестирование и показали отличный результат."
          icon={successModal.icon}
          showConfetti={true}
          action={{
            label: 'Продолжить обучение',
            onClick: () => console.log('Continue'),
          }}
        />

        <LoadingModal
          isOpen={loadingModal.isOpen}
          onClose={() => setLoadingModal({ ...loadingModal, isOpen: false })}
          title={
            loadingModal.status === 'success'
              ? 'Готово!'
              : `Загрузка...`
          }
          description={
            loadingModal.status === 'loading'
              ? 'Пожалуйста, дождитесь завершения операции'
              : 'Операция успешно завершена'
          }
          type={loadingModal.type}
          status={loadingModal.status}
          progress={loadingModal.progress}
          onCancel={() => console.log('Cancelled')}
        />

        <BottomSheet
          isOpen={bottomSheet}
          onClose={() => setBottomSheet(false)}
          title={
            <BottomSheetHeader
              icon={<Settings className="h-6 w-6" />}
              title="Действия"
              description="Выберите нужное действие"
            />
          }
          size="md"
        >
          <div className="space-y-2 py-2">
            <BottomSheetItem
              icon={<Edit3 className="h-5 w-5 text-blue-600" />}
              label="Редактировать"
              description="Изменить текущие данные"
              onClick={() => console.log('Edit')}
            />
            <BottomSheetItem
              icon={<Copy className="h-5 w-5 text-emerald-600" />}
              label="Копировать"
              description="Создать копию документа"
              onClick={() => console.log('Copy')}
            />
            <BottomSheetItem
              icon={<Share2 className="h-5 w-5 text-violet-600" />}
              label="Поделиться"
              description="Отправить ссылку коллеге"
              onClick={() => console.log('Share')}
              badge="New"
            />
            <BottomSheetItem
              icon={<Trash2 className="h-5 w-5 text-red-600" />}
              label="Удалить"
              description="Безвозвратно удалить данные"
              onClick={() => console.log('Delete')}
              destructive
            />
          </div>
        </BottomSheet>

        {/* Toast Container */}
        <ToastContainer
          toasts={toasts as any}
          onDismiss={removeToast}
          position="top-right"
        />
      </div>
    </PageTransition>
  );
}

export default UIPatternsShowcase;

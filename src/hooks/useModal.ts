import { useState, useCallback } from 'react';

/**
 * Хук для управления состоянием модального окна
 * 
 * @hook useModal
 * @description Предоставляет методы для открытия/закрытия модального окна
 * 
 * @param initialState - начальное состояние (по умолчанию false)
 * @param onCloseCallback - колбэк при закрытии
 * @returns Объект с методами управления
 * 
 * @example
 * ```tsx
 * const modal = useModal();
 * 
 * return (
 *   <>
 *     <Button onClick={modal.open}>Открыть</Button>
 *     <AnimatedModal isOpen={modal.isOpen} onClose={modal.close}>
 *       Контент
 *     </AnimatedModal>
 *   </>
 * );
 * ```
 */
export const useModal = (
  initialState: boolean = false,
  onCloseCallback?: () => void
) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    onCloseCallback?.();
  }, [onCloseCallback]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

/**
 * Хук для управления несколькими модальными окнами
 * 
 * @hook useModals
 * @description Управление множеством модальных окон по идентификаторам
 * 
 * @example
 * ```tsx
 * const modals = useModals(['login', 'register', 'settings']);
 * 
 * return (
 *   <>
 *     <Button onClick={() => modals.open('login')}>Войти</Button>
 *     <AnimatedModal isOpen={modals.isOpen('login')} onClose={() => modals.close('login')}>
 *       Форма входа
 *     </AnimatedModal>
 *   </>
 * );
 * ```
 */
export const useModals = (modalIds: string[] = []) => {
  const [openModals, setOpenModals] = useState<Record<string, boolean>>(() => {
    return modalIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
  });

  const open = useCallback((modalId: string) => {
    setOpenModals((prev) => ({ ...prev, [modalId]: true }));
  }, []);

  const close = useCallback((modalId: string) => {
    setOpenModals((prev) => ({ ...prev, [modalId]: false }));
  }, []);

  const closeAll = useCallback(() => {
    setOpenModals((prev) => {
      const closed = { ...prev };
      Object.keys(closed).forEach((key) => {
        closed[key] = false;
      });
      return closed;
    });
  }, []);

  const toggle = useCallback((modalId: string) => {
    setOpenModals((prev) => ({ ...prev, [modalId]: !prev[modalId] }));
  }, []);

  const isOpen = useCallback(
    (modalId: string) => {
      return openModals[modalId] || false;
    },
    [openModals]
  );

  return {
    open,
    close,
    closeAll,
    toggle,
    isOpen,
    openModals,
  };
};

/**
 * Хук для управления модальным окном с подтверждением закрытия
 * 
 * @hook useConfirmCloseModal
 * @description Модальное окно, которое запрашивает подтверждение перед закрытием
 * 
 * @param hasUnsavedChanges - есть ли несохранённые изменения
 * 
 * @example
 * ```tsx
 * const modal = useConfirmCloseModal(hasUnsavedChanges);
 * 
 * return (
 *   <AnimatedModal
 *     isOpen={modal.isOpen}
 *     onClose={modal.handleCloseRequest}
 *   >
 *     Контент
 *   </AnimatedModal>
 * );
 * ```
 */
export const useConfirmCloseModal = (hasUnsavedChanges: boolean = false) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    setPendingClose(false);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setPendingClose(false);
  }, []);

  const handleCloseRequest = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingClose(true);
      // Здесь можно показать диалог подтверждения
    } else {
      close();
    }
  }, [hasUnsavedChanges, close]);

  const confirmClose = useCallback(() => {
    close();
  }, [close]);

  const cancelClose = useCallback(() => {
    setPendingClose(false);
  }, []);

  return {
    isOpen,
    open,
    close,
    pendingClose,
    handleCloseRequest,
    confirmClose,
    cancelClose,
  };
};

export default useModal;

import '@testing-library/jest-dom'

// Глобальные переменные для тестов
declare global {
  var describe: unknown;
  var it: unknown;
  var expect: unknown;
  var beforeEach: unknown;
  var afterEach: unknown;
  var vi: unknown;
}

// Настройка localStorage для jsdom
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Исправление для TypeScript - проверка существования global
const setGlobalLocalStorage = () => {
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  }
};

setGlobalLocalStorage();

// Очистка localStorage перед каждым тестом
beforeEach(() => {
  localStorage.clear();
});

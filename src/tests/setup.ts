import '@testing-library/jest-dom'

// Глобальные переменные для тестов
declare global {
  var describe: any;
  var it: any;
  var expect: any;
  var beforeEach: any;
  var afterEach: any;
  var vi: any;
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

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Очистка localStorage перед каждым тестом
beforeEach(() => {
  localStorage.clear();
});

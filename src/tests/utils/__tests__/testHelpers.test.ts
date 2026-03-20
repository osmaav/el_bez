/**
 * Тесты для testHelpers — проверка корректности создания mock-объектов
 * 
 * @group Utils
 * @section Tests
 * @scenario Mock Objects Validation
 */

import { describe, it, expect } from 'vitest';
import { createMockQuestion, createMockQuestions, createMockUser } from '@/tests/utils/testHelpers';
import type { Question } from '@/types';

describe('testHelpers', () => {
  describe('createMockQuestion', () => {
    it('должен создавать вопрос с обязательными полями', () => {
      const question = createMockQuestion();

      // Проверяем наличие всех обязательных полей
      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('ticket');
      expect(question).toHaveProperty('text');
      expect(question).toHaveProperty('options');
      expect(question).toHaveProperty('correct_index');
    });

    it('должен создавать вопрос с правильными типами полей', () => {
      const question = createMockQuestion();

      // Проверяем типы полей
      expect(typeof question.id).toBe('number');
      expect(typeof question.ticket).toBe('number');
      expect(typeof question.text).toBe('string');
      expect(Array.isArray(question.options)).toBe(true);
      expect(Array.isArray(question.correct_index)).toBe(true);
    });

    it('должен создавать вопрос с массивом из 4 вариантов ответов', () => {
      const question = createMockQuestion();

      expect(question.options).toHaveLength(4);
      expect(question.options.every(opt => typeof opt === 'string')).toBe(true);
    });

    it('должен позволять переопределять поля через overrides', () => {
      const question = createMockQuestion({
        id: 999,
        ticket: 10,
        text: 'Кастомный вопрос',
        correct_index: [3],
      });

      expect(question.id).toBe(999);
      expect(question.ticket).toBe(10);
      expect(question.text).toBe('Кастомный вопрос');
      expect(question.correct_index).toEqual([3]);
    });

    it('должен сохранять поля по умолчанию при частичном переопределении', () => {
      const question = createMockQuestion({
        id: 999,
      });

      expect(question.id).toBe(999);
      expect(question.ticket).toBe(1); // значение по умолчанию
      expect(question.correct_index).toEqual([0]); // значение по умолчанию
    });

    it('не должен содержать лишних полей', () => {
      const question = createMockQuestion();

      // Проверяем что нет неожиданных полей
      const allowedKeys = ['id', 'ticket', 'text', 'options', 'correct_index', 'question', 'answers', 'correct', 'link'];
      const questionKeys = Object.keys(question);

      questionKeys.forEach(key => {
        expect(allowedKeys).toContain(key);
      });
    });

    it('должен создавать валидный объект Question для TypeScript', () => {
      const question: Question = createMockQuestion();

      // Если этот тест компилируется и проходит, значит типы корректны
      expect(question.id).toBe(1);
      expect(question.ticket).toBe(1);
      expect(question.correct_index).toEqual([0]);
    });
  });

  describe('createMockQuestions', () => {
    it('должен создавать массив вопросов указанной длины', () => {
      const questions = createMockQuestions(10);

      expect(questions).toHaveLength(10);
    });

    it('должен создавать вопросы с уникальными id', () => {
      const questions = createMockQuestions(20);

      const ids = questions.map(q => q.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(20);
    });

    it('должен создавать вопросы с последовательными id', () => {
      const questions = createMockQuestions(5);

      questions.forEach((q, index) => {
        expect(q.id).toBe(index + 1);
      });
    });

    it('должен создавать вопросы с правильными ticket', () => {
      const questions = createMockQuestions(25);

      questions.forEach((q, index) => {
        const expectedTicket = Math.floor(index / 10) + 1;
        expect(q.ticket).toBe(expectedTicket);
      });
    });

    it('должен создавать вопросы для раздела 1258-20 по умолчанию', () => {
      const questions = createMockQuestions(10, '1258-20');

      expect(questions).toHaveLength(10);
      // section не является полем Question, поэтому не проверяем
    });

    it('должен создавать вопросы для раздела 1256-19', () => {
      const questions = createMockQuestions(10, '1256-19');

      expect(questions).toHaveLength(10);
      // section не является полем Question, поэтому не проверяем
    });

    it('должен создавать валидный массив Question для TypeScript', () => {
      const questions: Question[] = createMockQuestions(10);

      // Если этот тест компилируется и проходит, значит типы корректны
      expect(questions).toHaveLength(10);
      expect(questions.every(q => typeof q.id === 'number')).toBe(true);
      expect(questions.every(q => typeof q.ticket === 'number')).toBe(true);
      expect(questions.every(q => typeof q.text === 'string')).toBe(true);
      expect(questions.every(q => Array.isArray(q.options))).toBe(true);
      expect(questions.every(q => Array.isArray(q.correct_index))).toBe(true);
    });
  });

  describe('createMockUser', () => {
    it('должен создавать пользователя с обязательными полями', () => {
      const user = createMockUser();

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('surname');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('birthDate');
      expect(user).toHaveProperty('workplace');
      expect(user).toHaveProperty('position');
      expect(user).toHaveProperty('emailVerified');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    it('должен создавать пользователя с правильными типами полей', () => {
      const user = createMockUser();

      expect(typeof user.id).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.surname).toBe('string');
      expect(typeof user.name).toBe('string');
      expect(typeof user.birthDate).toBe('string');
      expect(typeof user.workplace).toBe('string');
      expect(typeof user.position).toBe('string');
      expect(typeof user.emailVerified).toBe('boolean');
      expect(typeof user.createdAt).toBe('string');
      expect(typeof user.updatedAt).toBe('string');
    });

    it('должен позволять переопределять поля через overrides', () => {
      const user = createMockUser({
        id: 'custom-id',
        email: 'custom@example.com',
        emailVerified: false,
      });

      expect(user.id).toBe('custom-id');
      expect(user.email).toBe('custom@example.com');
      expect(user.emailVerified).toBe(false);
    });

    it('должен сохранять поля по умолчанию при частичном переопределении', () => {
      const user = createMockUser({
        id: 'custom-id',
      });

      expect(user.id).toBe('custom-id');
      expect(user.surname).toBe('Иванов'); // значение по умолчанию
      expect(user.name).toBe('Иван'); // значение по умолчанию
    });

    it('должен создавать patronymic опционально', () => {
      const userWithPatronymic = createMockUser({
        patronymic: 'Иванович',
      });

      const userWithoutPatronymic = createMockUser();

      expect(userWithPatronymic.patronymic).toBe('Иванович');
      expect(userWithoutPatronymic.patronymic).toBe('Иванович'); // значение по умолчанию
    });
  });

  describe('Интеграционные тесты', () => {
    it('должен создавать вопросы для использования в тестах экспорта PDF', () => {
      const questions = createMockQuestions(10, '1258-20');

      // Проверяем что вопросы можно использовать в тестах
      expect(questions).toHaveLength(10);
      expect(questions.every(q => q.options.length === 4)).toBe(true);
      expect(questions.every(q => Array.isArray(q.correct_index) && q.correct_index[0] >= 0 && q.correct_index[0] < 4)).toBe(true);
    });

    it('должен создавать вопросы с корректными correct_index', () => {
      const questions = createMockQuestions(20);

      questions.forEach(q => {
        expect(Array.isArray(q.correct_index)).toBe(true);
        expect(q.correct_index[0]).toBeGreaterThanOrEqual(0);
        expect(q.correct_index[0]).toBeLessThan(q.options.length);
      });
    });

    it('должен создавать валидные данные для тестов LearningSection', () => {
      const questions = createMockQuestions(30, '1258-20');

      // Проверяем что данные подходят для LearningSection
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.every(q => typeof q.text === 'string')).toBe(true);
      expect(questions.every(q => q.text.length > 0)).toBe(true);
    });
  });
});

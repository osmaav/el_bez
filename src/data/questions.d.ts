declare module '@/data/questions.json' {
  interface RawQuestion {
    id: number;
    ticket: number;
    question: string;
    answers: string[];
    correct: number;
    link: string;
  }

  interface QuestionsData {
    metadata: {
      name: string;
      description: string;
      totalQuestions: number;
      totalTickets: number;
      version: string;
    };
    questions: RawQuestion[];
  }

  const data: QuestionsData;
  export default data;
}

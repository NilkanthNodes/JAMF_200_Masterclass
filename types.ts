
export interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  staticQuizzes?: QuizQuestion[];
  staticScenario?: string;
}

export interface Topic {
  id: string;
  title: string;
  shortExplanation: string;
  moderateExplanation: string;
  detailedExplanation: string;
  industrialUseCase: string;
  keyTakeaways: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export type ViewState = 'reading' | 'quiz' | 'scenario' | 'ai-search';

export interface StudyProgress {
  completedTopicIds: string[];
}


import React from 'react';
import { QuizQuestion, Module } from '../types';
import { generateQuiz } from '../services/gemini';
import { Check, X, RefreshCw, Trophy, BrainCircuit, ShieldCheck } from 'lucide-react';

interface QuizViewProps {
  module: Module;
}

const QuizView: React.FC<QuizViewProps> = ({ module }) => {
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [showResults, setShowResults] = React.useState(false);
  const [isAiGenerated, setIsAiGenerated] = React.useState(false);

  const loadInitialQuiz = () => {
    if (module.staticQuizzes && module.staticQuizzes.length > 0) {
      setQuestions(module.staticQuizzes);
      setIsAiGenerated(false);
      setLoading(false);
    } else {
      fetchAiQuiz();
    }
  };

  const fetchAiQuiz = async () => {
    setLoading(true);
    setShowResults(false);
    setAnswers({});
    try {
      const content = module.topics.map(t => t.shortExplanation + t.moderateExplanation).join(' ');
      const qs = await generateQuiz(module.title, content);
      if (qs && qs.length > 0) {
        setQuestions(qs);
        setIsAiGenerated(true);
      } else {
        // Fallback to static if AI fails
        setQuestions(module.staticQuizzes || []);
        setIsAiGenerated(false);
      }
    } catch (e) {
      console.error(e);
      setQuestions(module.staticQuizzes || []);
      setIsAiGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadInitialQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
        <BrainCircuit className="w-16 h-16 text-blue-600 animate-pulse mb-6" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Generating dynamic quiz...</h3>
        <p className="text-slate-500">Reading through current module content...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 mb-4">No practice questions available for this module yet.</p>
        <button onClick={fetchAiQuiz} className="text-blue-600 font-bold hover:underline flex items-center gap-2 mx-auto">
          <BrainCircuit className="w-4 h-4" /> Try AI Generation
        </button>
      </div>
    );
  }

  const handleSelect = (qIdx: number, oIdx: number) => {
    if (showResults) return;
    setAnswers({ ...answers, [qIdx]: oIdx });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Practice Quiz
            {isAiGenerated ? (
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">AI Generated</span>
            ) : (
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Curriculum
              </span>
            )}
          </h3>
          <p className="text-slate-500">{questions.length} Exam-style questions</p>
        </div>
        <button 
          onClick={fetchAiQuiz}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 border border-slate-200 rounded-xl hover:border-blue-200 transition-all"
          title="Regenerate with AI"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">AI Regenerate</span>
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="text-lg font-bold text-slate-800 mb-6 flex gap-4">
              <span className="bg-slate-100 text-slate-500 w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0">{qIdx + 1}</span>
              {q.question}
            </h4>
            <div className="space-y-3">
              {q.options.map((opt, oIdx) => {
                const isSelected = answers[qIdx] === oIdx;
                const isCorrect = q.correctAnswer === oIdx;
                let bgClass = "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700";
                
                if (showResults) {
                  if (isCorrect) bgClass = "bg-green-50 border-green-200 text-green-700";
                  else if (isSelected) bgClass = "bg-red-50 border-red-200 text-red-700";
                  else bgClass = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                } else if (isSelected) {
                  bgClass = "bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-500";
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(qIdx, oIdx)}
                    disabled={showResults}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between font-medium ${bgClass}`}
                  >
                    <span>{opt}</span>
                    {showResults && isCorrect && <Check className="w-5 h-5 text-green-600" />}
                    {showResults && isSelected && !isCorrect && <X className="w-5 h-5 text-red-600" />}
                  </button>
                );
              })}
            </div>
            {showResults && (
              <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-sm text-blue-800">
                <p className="font-bold mb-1">Explanation:</p>
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {!showResults ? (
        <button
          onClick={() => setShowResults(true)}
          disabled={Object.keys(answers).length < questions.length}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Check My Answers
        </button>
      ) : (
        <div className="bg-slate-900 text-white rounded-3xl p-10 flex flex-col items-center text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mb-4" />
          <h4 className="text-3xl font-bold mb-2">Final Score: {calculateScore()} / {questions.length}</h4>
          <p className="text-slate-400 mb-6">
            {calculateScore() === questions.length ? "Perfect! You're ready for the exam." : "Good effort. Keep reviewing those concepts!"}
          </p>
          <button
            onClick={() => {
              setAnswers({});
              setShowResults(false);
            }}
            className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizView;


import React from 'react';
import { QuizQuestion } from '../types.ts';
import { generateQuiz } from '../services/gemini.ts';
import { Check, X, RefreshCw, Trophy, BrainCircuit } from 'lucide-react';

interface QuizViewProps {
  moduleTitle: string;
  moduleContent: string;
}

const QuizView: React.FC<QuizViewProps> = ({ moduleTitle, moduleContent }) => {
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [showResults, setShowResults] = React.useState(false);

  const fetchQuiz = async () => {
    setLoading(true);
    setShowResults(false);
    setAnswers({});
    try {
      const qs = await generateQuiz(moduleTitle, moduleContent);
      setQuestions(qs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleTitle]);

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
        <p className="text-slate-500 mb-4">Oops! Couldn't generate questions this time.</p>
        <button onClick={fetchQuiz} className="text-blue-600 font-bold hover:underline">Try Again</button>
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
          <h3 className="text-2xl font-bold text-slate-900">Module Knowledge Check</h3>
          <p className="text-slate-500">3 AI-generated practice questions</p>
        </div>
        <button 
          onClick={fetchQuiz}
          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          title="Regenerate Quiz"
        >
          <RefreshCw className="w-5 h-5" />
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
            onClick={fetchQuiz}
            className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition-colors"
          >
            Try New Questions
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizView;


import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { BookOpen, GraduationCap, ChevronRight, Menu, X, Search, CheckCircle, Sparkles, Send, CheckCircle2, HelpCircle, Layers, Info, ListTree, Briefcase, Check, BookOpenText, Target, Laptop2, ArrowLeft, Loader2, AlertCircle, RefreshCw, Trophy, BrainCircuit, Terminal, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { JAMF_MODULES } from './constants.tsx';
import { Module, Topic, QuizQuestion, ViewState } from './types.ts';
import { askAssistant, generateQuiz, generateScenario } from './services/gemini.ts';

// --- Components ---

const ModuleContent: React.FC<{
  topics: Topic[];
  completedIds: string[];
  onToggleComplete: (id: string) => void;
}> = ({ topics, completedIds, onToggleComplete }) => {
  const [activeLevels, setActiveLevels] = useState<Record<string, 'short' | 'moderate' | 'detail'>>({});

  return (
    <div className="space-y-10">
      {topics.map((topic) => {
        const isCompleted = completedIds.includes(topic.id);
        const currentLevel = activeLevels[topic.id] || 'moderate';
        let displayContent = topic.moderateExplanation;
        if (currentLevel === 'short') displayContent = topic.shortExplanation;
        if (currentLevel === 'detail') displayContent = topic.detailedExplanation;

        return (
          <section key={topic.id} className={`bg-white rounded-3xl border transition-all overflow-hidden ${isCompleted ? 'border-green-100 shadow-sm' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-2xl font-bold ${isCompleted ? 'text-green-700' : 'text-slate-900'}`}>
                      {topic.title}
                    </h3>
                    {isCompleted && <div className="bg-green-100 text-green-700 p-1 rounded-full"><Check className="w-4 h-4" /></div>}
                  </div>
                  <div className={`h-1.5 w-12 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-600'}`} />
                </div>
                <button 
                  onClick={() => onToggleComplete(topic.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm ${isCompleted ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
                >
                  {isCompleted ? <><Check className="w-4 h-4" /> Mastered</> : 'Mark as Mastered'}
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-slate-800 font-bold"><HelpCircle className="w-5 h-5 text-blue-600" />Expert Lesson</div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      {(['short', 'moderate', 'detail'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setActiveLevels(prev => ({ ...prev, [topic.id]: level }))}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${currentLevel === level ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <span className="capitalize">{level}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`p-6 rounded-2xl leading-relaxed transition-all ${currentLevel === 'detail' ? 'bg-slate-900 text-slate-300 font-mono text-[13px]' : 'bg-white text-slate-700 text-lg'}`}>
                    {displayContent}
                  </div>
                </div>
                <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100/50">
                  <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold"><Briefcase className="w-5 h-5 text-emerald-600" />Industrial Use Case</div>
                  <p className="text-emerald-700/80 italic text-sm">{topic.industrialUseCase}</p>
                </div>
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-600" />Key Exam Points</h4>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {topic.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="bg-white p-3 rounded-xl border border-blue-100 text-sm text-slate-600 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

const QuizView: React.FC<{ moduleTitle: string; moduleContent: string }> = ({ moduleTitle, moduleContent }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const fetchQuiz = async () => {
    setLoading(true); setShowResults(false); setAnswers({});
    try {
      const qs = await generateQuiz(moduleTitle, moduleContent);
      setQuestions(qs);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchQuiz(); }, [moduleTitle]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
      <BrainCircuit className="w-16 h-16 text-blue-600 animate-pulse mb-6" />
      <h3 className="text-xl font-bold text-slate-800 mb-2">Generating dynamic quiz...</h3>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div><h3 className="text-2xl font-bold text-slate-900">Module Knowledge Check</h3></div>
        <button onClick={fetchQuiz} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><RefreshCw className="w-5 h-5" /></button>
      </div>
      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="text-lg font-bold text-slate-800 mb-6 flex gap-4">
              <span className="bg-slate-100 text-slate-500 w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0">{qIdx + 1}</span>
              {q.question}
            </h4>
            <div className="space-y-3">
              {q.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => !showResults && setAnswers({ ...answers, [qIdx]: oIdx })}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between font-medium ${
                    showResults 
                      ? (q.correctAnswer === oIdx ? 'bg-green-50 border-green-200 text-green-700' : (answers[qIdx] === oIdx ? 'bg-red-50 border-red-200 text-red-700' : 'opacity-60'))
                      : (answers[qIdx] === oIdx ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-500' : 'bg-slate-50')
                  }`}
                >
                  <span>{opt}</span>
                  {showResults && q.correctAnswer === oIdx && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!showResults ? (
        <button onClick={() => setShowResults(true)} disabled={Object.keys(answers).length < questions.length} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 disabled:opacity-50">Check My Answers</button>
      ) : (
        <div className="bg-slate-900 text-white rounded-3xl p-10 flex flex-col items-center text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mb-4" />
          <h4 className="text-3xl font-bold mb-6">Final Score: {questions.filter((q, idx) => answers[idx] === q.correctAnswer).length} / {questions.length}</h4>
          <button onClick={fetchQuiz} className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full">Try New Questions</button>
        </div>
      )}
    </div>
  );
};

const ScenarioView: React.FC<{ moduleTitle: string }> = ({ moduleTitle }) => {
  const [scenario, setScenario] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResolution, setShowResolution] = useState(false);

  const fetchScenario = async () => {
    setLoading(true); setScenario(null); setShowResolution(false);
    try { const res = await generateScenario(moduleTitle); setScenario(res); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchScenario(); }, [moduleTitle]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" />
      <h3 className="text-xl font-bold text-slate-800">Crafting Lab Scenario...</h3>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="p-4 bg-slate-800 flex items-center gap-3"><Terminal className="w-5 h-5 text-green-400" /><span className="text-slate-300 font-mono text-sm uppercase">Lab Scenario</span></div>
        <div className="p-8 md:p-12 text-slate-300 whitespace-pre-wrap">{scenario?.split('Resolution')[0]}
          <div className="mt-12 border-t border-slate-800 pt-8">
            <button onClick={() => setShowResolution(!showResolution)} className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">{showResolution ? 'Hide Resolution' : 'Reveal Solution'}</button>
            {showResolution && <div className="mt-8 p-8 bg-slate-800/50 rounded-2xl border border-slate-700 text-slate-200">{scenario?.split('Resolution')[1]}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [currentModuleId, setCurrentModuleId] = useState(JAMF_MODULES[0].id);
  const [viewState, setViewState] = useState<ViewState>('reading');
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('jamf200_progress');
    return saved ? JSON.parse(saved) : [];
  });
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');

  const currentModule = JAMF_MODULES.find(m => m.id === currentModuleId) || JAMF_MODULES[0];
  const totalTopics = JAMF_MODULES.reduce((acc, m) => acc + m.topics.length, 0);
  const progressPercentage = Math.round((completedTopicIds.length / totalTopics) * 100);

  const toggleComplete = (topicId: string) => {
    setCompletedTopicIds(prev => {
      const next = prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId];
      localStorage.setItem('jamf200_progress', JSON.stringify(next));
      return next;
    });
  };

  const handleAiQuery = async (query: string) => {
    setAiLoading(true); setViewState('ai-search');
    try {
      const response = await askAssistant(query, `Module: ${currentModule.title}`);
      setAiResponse(response);
    } catch (e) { setAiResponse("Error connecting to AI."); } finally { setAiLoading(false); }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-xl"><Menu /></button>
      
      <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r transform transition-transform lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b"><div className="flex items-center gap-3"><div className="bg-blue-600 p-2 rounded-lg"><GraduationCap className="text-white w-6 h-6" /></div><div><h1 className="font-bold text-slate-900">Jamf 200</h1><p className="text-xs text-slate-500">MasterClass</p></div></div>
            <div className="mt-6"><div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2"><span>Progress</span><span>{progressPercentage}%</span></div><div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all" style={{ width: `${progressPercentage}%` }} /></div></div>
          </div>
          <div className="p-4 border-b bg-blue-50/30">
             <form onSubmit={(e) => { e.preventDefault(); if (aiInput) handleAiQuery(aiInput); }} className="relative">
                <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} type="text" placeholder="Ask AI..." className="w-full pl-3 pr-10 py-2.5 bg-white border border-blue-200 rounded-xl text-sm" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500"><Send className="w-4 h-4" /></button>
             </form>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {JAMF_MODULES.map((m) => (
              <button key={m.id} onClick={() => { setCurrentModuleId(m.id); setViewState('reading'); setIsSidebarOpen(false); }} className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all text-left ${currentModuleId === m.id ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className="text-sm font-semibold truncate">{m.title}</span><ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{currentModule.title}</h2>
          <div className="flex bg-slate-200/50 p-1 rounded-xl">
            {(['reading', 'quiz', 'scenario'] as const).map(s => (
              <button key={s} onClick={() => setViewState(s)} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${viewState === s ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>{s.toUpperCase()}</button>
            ))}
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
          {viewState === 'ai-search' ? (
            <div className="bg-white p-8 rounded-3xl border shadow-xl">
              <button onClick={() => setViewState('reading')} className="flex items-center gap-2 text-blue-600 font-bold mb-6"><ArrowLeft className="w-4 h-4" /> Back</button>
              {aiLoading ? <div className="flex flex-col items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : <div className="prose max-w-none text-slate-700 whitespace-pre-wrap">{aiResponse}</div>}
            </div>
          ) : viewState === 'reading' ? (
            <ModuleContent topics={currentModule.topics} completedIds={completedTopicIds} onToggleComplete={toggleComplete} />
          ) : viewState === 'quiz' ? (
            <QuizView moduleTitle={currentModule.title} moduleContent={currentModule.topics.map(t => t.moderateExplanation).join(' ')} />
          ) : (
            <ScenarioView moduleTitle={currentModule.title} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

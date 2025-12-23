
import React from 'react';
import Layout from './components/Layout.tsx';
import ModuleContent from './components/ModuleContent.tsx';
import QuizView from './components/QuizView.tsx';
import ScenarioView from './components/ScenarioView.tsx';
import { JAMF_MODULES } from './constants.tsx';
import { ViewState } from './types.ts';
import { BookOpenText, Target, Laptop2, Sparkles, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { askAssistant } from './services/gemini.ts';

const App: React.FC = () => {
  const [currentModuleId, setCurrentModuleId] = React.useState(JAMF_MODULES[0].id);
  const [viewState, setViewState] = React.useState<ViewState>('reading');
  const [completedTopicIds, setCompletedTopicIds] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jamf200_progress');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [aiResponse, setAiResponse] = React.useState<string | null>(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [lastQuery, setLastQuery] = React.useState('');

  const currentModule = JAMF_MODULES.find(m => m.id === currentModuleId) || JAMF_MODULES[0];
  const totalTopics = JAMF_MODULES.reduce((acc, m) => acc + m.topics.length, 0);

  const toggleComplete = (topicId: string) => {
    setCompletedTopicIds(prev => {
      const next = prev.includes(topicId) 
        ? prev.filter(id => id !== topicId) 
        : [...prev, topicId];
      localStorage.setItem('jamf200_progress', JSON.stringify(next));
      return next;
    });
  };

  const handleSelectModule = (id: string) => {
    setCurrentModuleId(id);
    setViewState('reading');
    setAiResponse(null);
  };

  const handleAiQuery = async (query: string) => {
    if (!process.env.API_KEY) {
      setAiResponse("Missing API Key. Please configure API_KEY in your Vercel Project Settings.");
      setViewState('ai-search');
      return;
    }

    setAiLoading(true);
    setViewState('ai-search');
    setLastQuery(query);
    try {
      const response = await askAssistant(query, `Current Module: ${currentModule.title}`);
      setAiResponse(response);
    } catch (e) {
      setAiResponse("Sorry, I encountered an error while searching. Please check your internet connection or API Key configuration.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Layout 
      modules={JAMF_MODULES} 
      currentModuleId={currentModuleId} 
      onSelectModule={handleSelectModule}
      completedCount={completedTopicIds.length}
      totalTopics={totalTopics}
      onAiQuery={handleAiQuery}
      isAiLoading={aiLoading}
    >
      {!process.env.API_KEY && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>AI features are disabled. Please add your <b>API_KEY</b> to Vercel Environment Variables.</p>
        </div>
      )}

      {viewState !== 'ai-search' && (
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl mb-10 w-fit">
          <button 
            onClick={() => setViewState('reading')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${viewState === 'reading' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <BookOpenText className="w-4 h-4" />
            Study Guide
          </button>
          <button 
            onClick={() => setViewState('quiz')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${viewState === 'quiz' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Target className="w-4 h-4" />
            Quiz
          </button>
          <button 
            onClick={() => setViewState('scenario')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${viewState === 'scenario' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Laptop2 className="w-4 h-4" />
            Labs
          </button>
        </div>
      )}

      <div className="pb-20">
        {viewState === 'ai-search' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <button 
              onClick={() => setViewState('reading')}
              className="flex items-center gap-2 text-blue-600 font-bold mb-6 hover:translate-x-[-4px] transition-all"
             >
               <ArrowLeft className="w-4 h-4" /> Back to Study Guide
             </button>
             
             <div className="bg-white rounded-3xl border border-blue-100 shadow-xl overflow-hidden">
                <div className="p-6 bg-blue-600 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    <h3 className="font-bold text-xl">Expert AI Search</h3>
                  </div>
                  <div className="text-blue-100 text-sm italic font-medium">"{lastQuery}"</div>
                </div>
                
                <div className="p-8 md:p-12 min-h-[300px]">
                   {aiLoading ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <p className="text-slate-500 font-medium animate-pulse">Consulting the Knowledge Base...</p>
                     </div>
                   ) : (
                     <div className="prose prose-slate max-w-none prose-headings:text-blue-900 prose-p:text-slate-700 prose-code:bg-slate-100 prose-code:p-1 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-200">
                        {aiResponse?.split('\n').map((line, i) => (
                           <p key={i} className="mb-4 whitespace-pre-wrap">{line}</p>
                        ))}
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {viewState === 'reading' && (
          <ModuleContent 
            topics={currentModule.topics} 
            completedIds={completedTopicIds}
            onToggleComplete={toggleComplete}
          />
        )}

        {viewState === 'quiz' && (
          <QuizView 
            moduleTitle={currentModule.title} 
            moduleContent={currentModule.topics.map(t => t.shortExplanation + t.moderateExplanation).join(' ')} 
          />
        )}

        {viewState === 'scenario' && (
          <ScenarioView moduleTitle={currentModule.title} />
        )}
      </div>

      <footer className="mt-20 border-t border-slate-100 pt-10 text-center">
        <p className="text-slate-400 text-sm">
          Jamf 200 MasterClass • Interactive Web Edition
        </p>
      </footer>
    </Layout>
  );
};

export default App;

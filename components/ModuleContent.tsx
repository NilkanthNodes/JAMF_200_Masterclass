
import React from 'react';
import { Topic } from '../types.ts';
import { CheckCircle2, HelpCircle, Layers, Info, ListTree, Briefcase, Check } from 'lucide-react';

interface ModuleContentProps {
  topics: Topic[];
  completedIds: string[];
  onToggleComplete: (id: string) => void;
}

type ExplanationLevel = 'short' | 'moderate' | 'detail';

const ModuleContent: React.FC<ModuleContentProps> = ({ topics, completedIds, onToggleComplete }) => {
  const [activeLevels, setActiveLevels] = React.useState<Record<string, ExplanationLevel>>({});

  const setLevel = (topicId: string, level: ExplanationLevel) => {
    setActiveLevels(prev => ({ ...prev, [topicId]: level }));
  };

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
                    {isCompleted && (
                      <div className="bg-green-100 text-green-700 p-1 rounded-full">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className={`h-1.5 w-12 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-600'}`} />
                </div>
                
                <button 
                  onClick={() => onToggleComplete(topic.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm ${
                    isCompleted 
                      ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {isCompleted ? <><Check className="w-4 h-4" /> Mastered</> : 'Mark as Mastered'}
                </button>
              </div>

              {/* Explanation Level Toggles */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                       <HelpCircle className="w-5 h-5 text-blue-600" />
                       Expert Lesson
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      {(['short', 'moderate', 'detail'] as ExplanationLevel[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => setLevel(topic.id, level)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            currentLevel === level 
                              ? 'bg-white text-blue-700 shadow-sm' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {level === 'short' && <Info className="w-3.5 h-3.5" />}
                          {level === 'moderate' && <Layers className="w-3.5 h-3.5" />}
                          {level === 'detail' && <ListTree className="w-3.5 h-3.5" />}
                          <span className="capitalize">{level}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl leading-relaxed text-slate-700 transition-all ${
                    currentLevel === 'detail' 
                      ? 'bg-slate-900 text-slate-300 font-mono text-[13px] border-none' 
                      : 'bg-white text-lg'
                  }`}>
                    {displayContent}
                  </div>
                </div>

                {/* Industrial Use Case */}
                <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100/50">
                  <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                    Industrial Use Case
                  </div>
                  <p className="text-emerald-700/80 italic text-sm">
                    {topic.industrialUseCase}
                  </p>
                </div>

                {/* Takeaways */}
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    Key Exam Points
                  </h4>
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

export default ModuleContent;

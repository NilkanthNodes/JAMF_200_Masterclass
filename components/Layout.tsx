
import React from 'react';
import { Module } from '../types.ts';
import { BookOpen, GraduationCap, ChevronRight, Menu, X, Search, CheckCircle, Sparkles, Send } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  modules: Module[];
  currentModuleId: string;
  onSelectModule: (id: string) => void;
  completedCount: number;
  totalTopics: number;
  onAiQuery: (query: string) => void;
  isAiLoading?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, modules, currentModuleId, onSelectModule, completedCount, totalTopics, onAiQuery, isAiLoading }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [aiInput, setAiInput] = React.useState('');

  const progressPercentage = Math.round((completedCount / totalTopics) * 100);

  const filteredModules = modules.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.topics.some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isAiLoading) return;
    onAiQuery(aiInput);
    setAiInput('');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Mobile Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-colors"
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 leading-tight">Jamf 200</h1>
                <p className="text-xs text-slate-500 font-medium">MasterClass Guide</p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mt-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-slate-100 bg-blue-50/30">
             <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1">
               <Sparkles className="w-3 h-3" /> Ask Expert AI
             </div>
             <form onSubmit={handleAiSubmit} className="relative">
                <input 
                  type="text" 
                  placeholder="Need more details? Ask..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
                <button 
                  type="submit" 
                  disabled={isAiLoading || !aiInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 disabled:text-slate-300"
                >
                  {isAiLoading ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
             </form>
          </div>

          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search curriculum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredModules.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onSelectModule(m.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all text-left group ${
                  currentModuleId === m.id 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <BookOpen className={`w-4 h-4 flex-shrink-0 ${currentModuleId === m.id ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-semibold truncate">{m.title}</span>
                </div>
                <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-transform ${currentModuleId === m.id ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 truncate pr-4">
              {modules.find(m => m.id === currentModuleId)?.title}
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="hidden sm:inline">Expert Guide Active</span>
            </div>
          </div>
        </header>
        <div className="p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;

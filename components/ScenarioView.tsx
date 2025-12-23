
import React from 'react';
import { generateScenario } from '../services/gemini';
import { Module } from '../types';
import { Terminal, Lightbulb, ChevronDown, ChevronUp, ShieldCheck, BrainCircuit } from 'lucide-react';

interface ScenarioViewProps {
  module: Module;
}

const ScenarioView: React.FC<ScenarioViewProps> = ({ module }) => {
  const [scenario, setScenario] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showResolution, setShowResolution] = React.useState(false);
  const [isAiGenerated, setIsAiGenerated] = React.useState(false);

  const loadInitialScenario = () => {
    if (module.staticScenario) {
      setScenario(module.staticScenario);
      setIsAiGenerated(false);
    } else {
      fetchAiScenario();
    }
  };

  const fetchAiScenario = async () => {
    setLoading(true);
    setScenario(null);
    setShowResolution(false);
    try {
      const res = await generateScenario(module.title);
      if (res) {
        setScenario(res);
        setIsAiGenerated(true);
      } else {
        setScenario(module.staticScenario || "No scenario available.");
        setIsAiGenerated(false);
      }
    } catch (e) {
      console.error(e);
      setScenario(module.staticScenario || "No scenario available.");
      setIsAiGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadInitialScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Crafting Lab Scenario...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="p-4 bg-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-green-400" />
            <span className="text-slate-300 font-mono text-sm tracking-wider uppercase">Practical Scenario</span>
          </div>
          {isAiGenerated ? (
            <span className="text-[10px] bg-blue-900/50 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <BrainCircuit className="w-3 h-3" /> AI Generated
            </span>
          ) : (
            <span className="text-[10px] bg-green-900/50 text-green-400 border border-green-800 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified Lab
            </span>
          )}
        </div>
        <div className="p-8 md:p-12">
          <div className="prose prose-invert max-w-none prose-headings:text-blue-400 prose-p:text-slate-300 prose-strong:text-white">
            {scenario?.split('Resolution')[0].split('\n').map((line, idx) => (
              <p key={idx} className="whitespace-pre-wrap">{line}</p>
            ))}
          </div>

          <div className="mt-12 border-t border-slate-800 pt-8">
            <button
              onClick={() => setShowResolution(!showResolution)}
              className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all w-full md:w-auto"
            >
              <Lightbulb className="w-5 h-5" />
              {showResolution ? 'Hide Resolution' : 'Reveal Recommended Solution'}
              {showResolution ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showResolution && (
              <div className="mt-8 p-8 bg-slate-800/50 rounded-2xl border border-slate-700 animate-in zoom-in-95 duration-300">
                <div className="prose prose-invert max-w-none prose-headings:text-green-400 prose-p:text-slate-200">
                  <h4 className="text-green-400 font-bold text-xl mb-4">Recommended Approach</h4>
                  {scenario?.includes('Resolution') 
                    ? scenario.split('Resolution')[1].split('\n').map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))
                    : "Problem solved!"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={fetchAiScenario}
          className="text-slate-500 hover:text-blue-600 font-medium text-sm flex items-center gap-2"
        >
          <BrainCircuit className="w-4 h-4" /> Generate Different AI Scenario
        </button>
      </div>
    </div>
  );
};

export default ScenarioView;

import { Heart } from "lucide-react";

interface Charity {
  id: string;
  name: string;
  description: string | null;
}

interface StepCharityProps {
  charities: Charity[];
  selectedCharity: string | null;
  setSelectedCharity: (id: string | null) => void;
}

const StepCharity = ({ charities, selectedCharity, setSelectedCharity }: StepCharityProps) => (
  <div className="space-y-4">
    <div className="mb-4">
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Apoiar instituição</p>
      <p className="text-xs text-stone-400 font-medium">Sua compra pode apoiar uma causa (opcional)</p>
    </div>

    <div className="grid grid-cols-1 gap-2">
      <button
        onClick={() => setSelectedCharity(null)}
        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
          selectedCharity === null 
          ? "border-stone-900 bg-stone-900 text-white shadow-lg shadow-stone-900/10" 
          : "border-stone-100 bg-white text-stone-600 hover:border-stone-200"
        }`}
      >
        <span className="text-sm font-semibold">Nenhuma em particular</span>
        {selectedCharity === null && <div className="h-2 w-2 rounded-full bg-gold" />}
      </button>

      {charities.map((c) => (
        <button
          key={c.id}
          onClick={() => setSelectedCharity(c.id)}
          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
            selectedCharity === c.id 
            ? "border-stone-900 bg-white shadow-xl shadow-stone-200/50" 
            : "border-stone-100 bg-white text-stone-600 hover:border-stone-200"
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className={`text-sm font-bold ${selectedCharity === c.id ? "text-stone-900" : "text-stone-600"}`}>
                {c.name}
              </p>
              {selectedCharity === c.id && <Heart className="h-3 w-3 text-gold fill-gold" />}
            </div>
            {c.description && (
              <p className="text-xs text-stone-400 line-clamp-1 italic">{c.description}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  </div>
);

export default StepCharity;

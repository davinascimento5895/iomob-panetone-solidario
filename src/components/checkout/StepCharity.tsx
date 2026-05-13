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
    <div className="mb-2 ml-0.5">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Apoiar Instituição</p>
      <p className="text-[11px] text-gray-400 font-medium">Sua compra pode apoiar uma causa social (opcional)</p>
    </div>

    <div className="grid grid-cols-1 gap-2">
      <button
        onClick={() => setSelectedCharity(null)}
        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
          selectedCharity === null 
          ? "border-navy bg-navy/5 text-navy-dark ring-1 ring-navy/10" 
          : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
        }`}
      >
        <span className="text-xs font-bold uppercase tracking-tight">Nenhuma em particular</span>
        {selectedCharity === null && <div className="h-1.5 w-1.5 rounded-full bg-navy" />}
      </button>

      {charities.map((c) => (
        <button
          key={c.id}
          onClick={() => setSelectedCharity(c.id)}
          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
            selectedCharity === c.id 
            ? "border-navy bg-navy/5 text-navy-dark ring-1 ring-navy/10" 
            : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <p className={`text-xs font-bold uppercase tracking-tight ${selectedCharity === c.id ? "text-navy-dark" : "text-gray-500"}`}>
                {c.name}
              </p>
              {selectedCharity === c.id && <Heart className="h-3 w-3 text-navy fill-navy" />}
            </div>
            {c.description && (
              <p className="text-[10px] text-gray-400 line-clamp-1 italic">{c.description}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  </div>
);

export default StepCharity;

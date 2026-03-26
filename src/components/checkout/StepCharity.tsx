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
  <div className="space-y-2 animate-fade-in">
    <div className="mb-1">
      <p className="text-xs font-bold text-foreground uppercase tracking-wide">Beneficie uma instituição</p>
      <p className="text-xs text-muted-foreground mt-0.5">Opcional — escolha se desejar apoiar uma causa</p>
    </div>

    <button
      onClick={() => setSelectedCharity(null)}
      className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
        selectedCharity === null ? "border-gold bg-gold/10" : "border-border hover:border-gold/30"
      }`}
    >
      <div
        className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          selectedCharity === null ? "bg-gold text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        <span className="text-sm font-bold">—</span>
      </div>
      <p className="text-sm font-bold text-foreground">Nenhuma</p>
    </button>

    {charities.map((c) => (
      <button
        key={c.id}
        onClick={() => setSelectedCharity(c.id)}
        className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
          selectedCharity === c.id ? "border-gold bg-gold/10" : "border-border hover:border-gold/30"
        }`}
      >
        <div
          className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            selectedCharity === c.id ? "bg-gold text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <Heart className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{c.name}</p>
          {c.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{c.description}</p>
          )}
        </div>
      </button>
    ))}
  </div>
);

export default StepCharity;

import { ArrowLeft, Check } from "lucide-react";

const STEPS = ["Resumo", "Pagamento", "Instituição", "Confirmar"];

interface CheckoutHeaderProps {
  step: number;
  onBack: () => void;
}

const CheckoutHeader = ({ step, onBack }: CheckoutHeaderProps) => (
  <div className="bg-[#FAFAFA] border-b border-stone-100">
    <header className="bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 rounded-full hover:bg-stone-50 text-stone-900 transition-all flex items-center gap-2 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">Voltar</span>
        </button>
        
        <div className="flex flex-col items-center">
          <span className="font-display font-bold text-stone-900 text-lg">Checkout</span>
          <span className="text-stone-400 text-[10px] uppercase font-bold tracking-[0.2em] mt-0.5">
            Passo {step + 1} de {STEPS.length}
          </span>
        </div>

        <div className="w-10 sm:w-20" /> {/* Spacer for centering */}
      </div>
      
      {/* Horizontal Progress bar */}
      <div className="h-0.5 w-full bg-stone-50">
        <div
          className="h-full bg-gold transition-all duration-700 ease-in-out"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </header>

    {/* Elegant Step Indicators */}
    <div className="max-w-2xl mx-auto flex items-center justify-between py-6 px-10">
      {STEPS.map((s, i) => (
        <div key={s} className="flex flex-col items-center gap-2 relative">
          <div
            className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
              i <= step ? "bg-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]" : "bg-stone-200"
            }`}
          />
          <span
            className={`text-[9px] uppercase font-bold tracking-widest transition-colors duration-500 ${
              i === step ? "text-stone-900" : "text-stone-300"
            }`}
          >
            {s}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export { STEPS };
export default CheckoutHeader;

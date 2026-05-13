import { ArrowLeft, Check } from "lucide-react";

const STEPS = ["Resumo", "Pagamento", "Instituição", "Confirmar"];

interface CheckoutHeaderProps {
  step: number;
  onBack: () => void;
}

const CheckoutHeader = ({ step, onBack }: CheckoutHeaderProps) => (
  <div className="bg-gray-50/50 border-b border-gray-100">
    <header className="bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-navy-dark transition-all flex items-center gap-2 group"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Voltar</span>
        </button>
        
        <div className="flex flex-col items-center">
          <span className="font-bold text-navy-dark text-sm uppercase tracking-widest">Checkout</span>
          <span className="text-gray-400 text-[9px] uppercase font-bold tracking-widest mt-0.5">
            Etapa {step + 1} de {STEPS.length}
          </span>
        </div>

        <div className="w-10 sm:w-20" />
      </div>
      
      <div className="h-0.5 w-full bg-gray-50">
        <div
          className="h-full bg-navy transition-all duration-700 ease-out"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </header>

    {/* Step Indicators */}
    <div className="max-w-2xl mx-auto flex items-center justify-between py-4 px-8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex flex-col items-center gap-1.5 relative">
          <div
            className={`h-1 w-6 rounded-full transition-all duration-500 ${
              i <= step ? "bg-navy" : "bg-gray-200"
            }`}
          />
          <span
            className={`text-[8px] uppercase font-bold tracking-widest transition-colors duration-500 ${
              i === step ? "text-navy-dark" : "text-gray-300"
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

import { ArrowLeft, Check } from "lucide-react";

const STEPS = ["Resumo", "Pagamento", "Instituição", "Confirmar"];

interface CheckoutHeaderProps {
  step: number;
  onBack: () => void;
}

const CheckoutHeader = ({ step, onBack }: CheckoutHeaderProps) => (
  <>
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
      <div className="flex items-center gap-3 px-4 h-14">
        <button onClick={onBack} className="p-2 -ml-1 rounded-lg hover:bg-primary-foreground/10 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="font-display font-bold text-base md:text-lg">Checkout</span>
        <span className="text-primary-foreground/60 text-sm ml-auto">
          Passo {step + 1} de {STEPS.length}
        </span>
      </div>
      <div className="h-1 bg-primary-foreground/10">
        <div
          className="h-full bg-gold transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </header>

    <div className="flex items-center justify-center gap-3 py-3 px-4">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              i < step
                ? "bg-gold text-primary"
                : i === step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {i < step ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          <span
            className={`text-xs md:text-sm font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}
          >
            {s}
          </span>
          {i < STEPS.length - 1 && <div className="w-6 md:w-10 h-px bg-border mx-1" />}
        </div>
      ))}
    </div>
  </>
);

export { STEPS };
export default CheckoutHeader;

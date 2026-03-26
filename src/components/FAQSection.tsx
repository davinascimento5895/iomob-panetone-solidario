import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "O que é o Panetone Solidário?",
    answer:
      "O Panetone Solidário é uma campanha do Rotary Club Connect que arrecada fundos para projetos humanitários. Ao comprar um panetone, você contribui para ações de saúde, educação e assistência social na sua comunidade.",
  },
  {
    question: "Como funciona a retirada?",
    answer:
      "Após confirmar seu pedido, você receberá um código de retirada de 6 caracteres. Quando o status do pedido mudar para \"Pronto para Retirada\", basta apresentar esse código no local combinado para receber seus panetones.",
  },
  {
    question: "Quais são as formas de pagamento?",
    answer:
      "Atualmente aceitamos pagamento na retirada (dinheiro ou cartão). Em breve teremos opções de pagamento via PIX e cartão de crédito/débito diretamente pela plataforma.",
  },
  {
    question: "Para onde vai o dinheiro arrecadado?",
    answer:
      "100% do lucro é revertido para projetos humanitários do Rotary Club Connect, incluindo campanhas de saúde, bolsas de estudo, doações de alimentos e apoio a comunidades carentes.",
  },
  {
    question: "Posso cancelar meu pedido?",
    answer:
      "Sim, entre em contato com nossa equipe pelo WhatsApp informando seu código de retirada. O cancelamento será processado e o estoque será devolvido automaticamente.",
  },
  {
    question: "Qual a validade dos panetones?",
    answer:
      "Nossos panetones possuem validade de 6 meses a partir da data de fabricação, garantindo frescor e qualidade.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/3 rounded-full blur-3xl translate-x-1/2" />

      <div className="container mx-auto px-4 relative">
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-8 md:gap-16 max-w-5xl mx-auto">
          {/* Left - Title */}
          <div className="space-y-6">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-gold-dark">
              Dúvidas Frequentes
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
              Perguntas{" "}
              <span className="text-gradient-gold">Frequentes</span>
            </h2>
            <div className="w-16 h-1 bg-gold rounded-full" />
            <p className="text-muted-foreground text-base leading-relaxed">
              Tire suas dúvidas sobre a campanha e como funciona o processo de compra.
            </p>
            <div className="hidden md:flex items-center gap-3 p-5 rounded-2xl bg-gold/5 border border-gold/15">
              <HelpCircle className="h-5 w-5 text-gold-dark flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Não encontrou sua dúvida? Entre em contato pelo{" "}
                <a href="#contato" className="text-gold-dark font-semibold hover:underline">
                  WhatsApp
                </a>
                .
              </p>
            </div>
          </div>

          {/* Right - Accordion */}
          <div>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card rounded-2xl px-6 border border-border/50 shadow-none hover:border-gold/20 hover:shadow-sm transition-all duration-300 data-[state=open]:border-gold/30 data-[state=open]:shadow-gold"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-gold-dark hover:no-underline py-5 text-sm md:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

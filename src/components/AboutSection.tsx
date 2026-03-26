import { Heart, Users, Globe, Award } from "lucide-react";

const stats = [
  { icon: Heart, label: "Projetos Apoiados", value: "150+", color: "from-rose-500/20 to-rose-500/5" },
  { icon: Users, label: "Famílias Beneficiadas", value: "5.000+", color: "from-blue-500/20 to-blue-500/5" },
  { icon: Globe, label: "Cidades Atendidas", value: "30+", color: "from-emerald-500/20 to-emerald-500/5" },
  { icon: Award, label: "Anos de Tradição", value: "10+", color: "from-amber-500/20 to-amber-500/5" },
];

const AboutSection = () => {
  return (
    <section id="sobre" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/3 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-navy/5 rounded-full blur-3xl translate-y-1/2" />

      <div className="container mx-auto px-4 relative">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-16 md:mb-20">
          {/* Text content */}
          <div className="space-y-6">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-gold-dark">
              Nossa Missão
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-[1.1]">
              Cada panetone{" "}
              <span className="text-gradient-gold">transforma vidas</span>
            </h2>
            <div className="w-16 h-1 bg-gold rounded-full" />
            <p className="text-muted-foreground text-lg leading-relaxed">
              O Rotary Club Connect realiza projetos humanitários em diversas áreas.
              Ao adquirir nossos panetones, você contribui diretamente para ações
              de saúde, educação e assistência social.
            </p>
            <p className="text-muted-foreground/70 text-base leading-relaxed">
              São mais de 10 anos de tradição levando esperança e transformação para
              comunidades em todo o Brasil. Cada unidade vendida representa um passo
              a mais na construção de um futuro melhor.
            </p>
          </div>

          {/* Visual element */}
          <div className="relative overflow-hidden">
            <div className="absolute -inset-2 md:-inset-4 bg-gold/5 rounded-3xl" />
            <div className="relative bg-card border border-border/50 rounded-3xl p-6 md:p-10 shadow-sm">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gold/10 flex items-center justify-center">
                  <Heart className="h-10 w-10 text-gold-dark" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  100% do Lucro Revertido
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                  Todo o valor arrecadado com a venda dos panetones é investido em
                  projetos sociais do Rotary Club Connect.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative flex flex-col items-center p-6 md:p-8 rounded-2xl bg-card border border-border/50 hover:border-gold/30 hover:shadow-gold transition-all duration-500 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-7 w-7 text-gold-dark" />
              </div>
              <span className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground mt-2 text-center tracking-wide font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

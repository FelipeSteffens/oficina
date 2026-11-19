import {
  ArrowRight, BarChart3, CalendarCheck, CarFront, CheckCircle2, ClipboardList,
  FileText, Gauge, History, Mail, MessageCircle, Package, Phone, ShieldCheck,
  Smartphone, Users, Wrench,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

const FEATURES_OFICINA = [
  { icon: ClipboardList, title: 'Ordens de serviço', text: 'Do diagnóstico à conclusão, com status, mecânicos e valores em um só lugar.' },
  { icon: FileText, title: 'Orçamentos ágeis', text: 'Envie propostas detalhadas e receba a aprovação do cliente direto no painel.' },
  { icon: Package, title: 'Estoque inteligente', text: 'Peças com SKU, estoque mínimo, movimentações e baixa automática ao concluir a OS.' },
  { icon: BarChart3, title: 'Gestão orientada a dados', text: 'KPIs, gráficos de desempenho e relatórios em PDF para decisões rápidas.' },
];

const FEATURES_CLIENTE = [
  { icon: CarFront, title: 'Garagem digital', text: 'Cadastre quantos veículos quiser, com placa, km, chassi e autorizações por oficina.' },
  { icon: History, title: 'Histórico portátil', text: 'Todas as manutenções pertencem ao veículo — mesmo se você trocar de oficina.' },
  { icon: ShieldCheck, title: 'Autorização expressa', text: 'Você decide quais oficinas podem acessar cada veículo. Revogue quando quiser.' },
  { icon: Smartphone, title: 'Aprovação na palma da mão', text: 'Aprove orçamentos, acompanhe serviços e exporte o histórico em PDF.' },
];

const STEPS = [
  { n: '01', icon: Users, title: 'Crie sua conta', text: 'Motorista ou oficina: cadastro em menos de um minuto.' },
  { n: '02', icon: ShieldCheck, title: 'Autorize o acesso', text: 'O proprietário vincula o veículo à oficina de sua confiança.' },
  { n: '03', icon: Wrench, title: 'Trabalhe com transparência', text: 'Orçamento, OS, estoque e histórico sincronizados em tempo real.' },
];

export default function LandingPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute inset-0 bg-grid-pattern bg-[size:44px_44px] opacity-30" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28 lg:px-8">
          <div className="animate-fade-up">
            <Badge tone="navy" className="mb-6 border-white/10 bg-white/10 !text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Plataforma multi-tenant para oficinas
            </Badge>
            <h1 className="text-balance font-display text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              Sua oficina em <span className="text-brand-200">modo performance.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Gestão completa de ordens de serviço, estoque e orçamentos — conectada a um histórico digital que acompanha o veículo onde ele estiver.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/cadastro" size="lg" icon={ArrowRight}>Começar gratuitamente</Button>
              <Button to="/login" size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20">
                Já tenho conta
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/60">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Sem etapas burocráticas</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Histórico pertence ao veículo</span>
            </div>
          </div>

          {/* Painel ilustrativo */}
          <div className="animate-fade-up [animation-delay:150ms]">
            <div className="relative rounded-3xl border border-white/10 bg-white p-5 shadow-2xl shadow-black/30 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink-500">Painel operacional</p>
                  <p className="font-display text-xl font-extrabold text-navy-900">Visão da oficina</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white"><Gauge size={22} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Serviços ativos', value: '12', tone: 'bg-brand-50 text-brand-700' },
                  { label: 'Aprovações', value: '04', tone: 'bg-amber-50 text-amber-700' },
                  { label: 'Faturado', value: 'R$ 18k', tone: 'bg-emerald-50 text-emerald-700' },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl p-3 ${item.tone}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">{item.label}</p>
                    <p className="mt-1 font-display text-lg font-extrabold">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2.5">
                {[
                  { placa: 'ABC-1D23', modelo: 'Corolla XEi', status: 'Em andamento', cor: 'bg-blue-500' },
                  { placa: 'DEF-4G56', modelo: 'Civic EXL', status: 'Aguardando peças', cor: 'bg-violet-500' },
                  { placa: 'GHI-7J89', modelo: 'Golf GTI', status: 'Concluída', cor: 'bg-emerald-500' },
                ].map((row) => (
                  <div key={row.placa} className="flex items-center gap-3 rounded-xl border border-surface-line px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-white"><CarFront size={16} /></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-navy-900">{row.placa}</p>
                      <p className="text-xs text-ink-500">{row.modelo}</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-700"><span className={`h-1.5 w-1.5 rounded-full ${row.cor}`} />{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white/10 bg-navy-800 p-3.5 shadow-xl sm:block">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400"><ShieldCheck size={18} /></div>
                <div><p className="text-xs font-bold">Histórico imutável</p><p className="text-[11px] text-white/50">registrado no blockchain documental</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES OFICINA */}
      <section id="recursos" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Para oficinas mecânicas</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-navy-900 sm:text-4xl">Tudo o que sua equipe precisa, em uma interface só.</h2>
          <p className="mt-4 text-ink-500">Menos planilhas, mais produtividade. Do orçamento à baixa de estoque, cada etapa é rastreada.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES_OFICINA.map((feature) => (
            <article key={feature.title} className="card group p-6 transition hover:-translate-y-1 hover:shadow-lift">
              <div className="mb-5 inline-flex rounded-xl bg-brand-50 p-3 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <feature.icon size={22} />
              </div>
              <h3 className="font-display text-base font-bold text-navy-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FEATURES CLIENTE */}
      <section id="motoristas" className="border-y border-surface-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Para motoristas</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-navy-900 sm:text-4xl">Seu carro, sua história, sempre com você.</h2>
              <p className="mt-4 text-ink-500">A garagem digital reúne cada manutenção em um histórico portátil verificável — valorize seu veículo na hora de vender.</p>
              <div className="mt-8 space-y-4">
                {FEATURES_CLIENTE.map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white"><feature.icon size={18} /></div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-navy-900">{feature.title}</h3>
                      <p className="mt-0.5 text-sm text-ink-500">{feature.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-brand-50" />
              <div className="relative rounded-2xl border border-surface-line bg-white p-6 shadow-card">
                <p className="font-display text-sm font-bold text-navy-900">Histórico Digital · ABC-1D23</p>
                <div className="mt-5 space-y-4">
                  {[
                    { date: '12/09/2026', text: 'Revisão 45.000 km · Troca de óleo e filtros', of: 'AutoTrack Center' },
                    { date: '08/03/2026', text: 'Alinhamento e balanceamento', of: 'SpeedGarage' },
                    { date: '20/11/2025', text: 'Substituição de pastilhas dianteiras', of: 'AutoTrack Center' },
                  ].map((item, index) => (
                    <div key={item.date} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-brand-600' : 'bg-slate-300'}`} />
                        {index < 2 && <span className="mt-1 h-full w-0.5 flex-1 bg-surface-line" />}
                      </div>
                      <div className="pb-2">
                        <p className="text-sm font-bold text-navy-900">{item.text}</p>
                        <p className="text-xs text-ink-500">{item.date} · {item.of}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Como funciona</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-navy-900 sm:text-4xl">Três passos para começar</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="relative rounded-2xl border border-surface-line bg-white p-6 shadow-card">
              <span className="absolute right-5 top-4 font-display text-4xl font-extrabold text-surface-line">{step.n}</span>
              <div className="mb-4 inline-flex rounded-xl bg-navy-900 p-3 text-white"><step.icon size={20} /></div>
              <h3 className="font-display text-base font-bold text-navy-900">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-500">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA + CONTATO */}
      <section className="bg-navy-900">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-white">Pronto para acelerar sua gestão?</h2>
            <p className="mt-3 max-w-md text-white/60">Crie sua conta e tenha acesso imediato a todos os recursos. Dados de teste disponíveis na tela de login.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/cadastro" size="lg">Criar minha conta</Button>
              <Button to="/login" size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20">Fazer login</Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: MessageCircle, label: 'WhatsApp', value: '(11) 4000-1234', href: 'https://wa.me/551140001234' },
              { icon: Mail, label: 'E-mail', value: 'contato@autotrackpro.com', href: 'mailto:contato@autotrackpro.com' },
              { icon: Phone, label: 'Telefone', value: '(11) 4000-1234', href: 'tel:+551140001234' },
            ].map((channel) => (
              <a key={channel.label} href={channel.href} target={channel.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white transition hover:bg-white/10">
                <channel.icon size={20} className="text-brand-200" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-white/40">{channel.label}</p>
                <p className="mt-1 text-sm font-semibold">{channel.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <CalendarCheck size={28} className="mx-auto text-brand-600" />
          <h2 className="mt-4 font-display text-2xl font-extrabold text-navy-900">Precisa de um orçamento ou demonstração?</h2>
          <p className="mt-2 text-ink-500">Preencha o formulário de contato e nossa equipe responde rapidamente.</p>
          <div className="mt-6"><Button to="/contato" icon={ArrowRight}>Falar com a equipe</Button></div>
        </div>
      </section>
    </div>
  );
}

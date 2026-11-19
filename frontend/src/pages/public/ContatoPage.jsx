import { useState } from 'react';
import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Button from '../../components/ui/Button.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { contatoService } from '../../services/contatoService.js';
import { getErrorMessage } from '../../services/api.js';

const CHANNELS = [
  { icon: MessageCircle, label: 'WhatsApp', value: '(11) 4000-1234', sub: 'Atendimento rápido', href: 'https://wa.me/551140001234' },
  { icon: Mail, label: 'E-mail', value: 'contato@autotrackpro.com', sub: 'Resposta em até 24h', href: 'mailto:contato@autotrackpro.com' },
  { icon: Phone, label: 'Telefone', value: '(11) 4000-1234', sub: 'Seg a Sex, 8h às 18h', href: 'tel:+551140001234' },
  { icon: MapPin, label: 'Endereço', value: 'Av. das Nações, 1200', sub: 'São Paulo — SP', href: null },
];

export default function ContatoPage() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await contatoService.send(form);
      toast.success(result?.message || 'Mensagem enviada com sucesso!');
      setForm({ nome: '', email: '', telefone: '', mensagem: '' });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível enviar a mensagem.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Fale conosco</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-navy-900">Estamos aqui para ajudar</h1>
        <p className="mt-3 text-ink-500">Dúvidas sobre a plataforma, demonstração ou suporte: escolha o canal que preferir.</p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          {CHANNELS.map((channel) => {
            const content = (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><channel.icon size={20} /></div>
                <div className="ml-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-500">{channel.label}</p>
                  <p className="mt-0.5 font-display font-bold text-navy-900">{channel.value}</p>
                  <p className="text-xs text-ink-400">{channel.sub}</p>
                </div>
              </>
            );
            return channel.href ? (
              <a key={channel.label} href={channel.href} target={channel.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                className="card flex items-center p-4 transition hover:-translate-y-0.5 hover:shadow-lift">{content}</a>
            ) : (
              <div key={channel.label} className="card flex items-center p-4">{content}</div>
            );
          })}
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
          <h2 className="section-title text-xl">Envie uma mensagem</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" name="nome" value={form.nome} onChange={(e) => setForm((c) => ({ ...c, nome: e.target.value }))} required />
            <Input label="E-mail" name="email" type="email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} required />
          </div>
          <Input label="Telefone (opcional)" name="telefone" value={form.telefone} onChange={(e) => setForm((c) => ({ ...c, telefone: e.target.value }))} />
          <Textarea label="Mensagem" name="mensagem" value={form.mensagem} onChange={(e) => setForm((c) => ({ ...c, mensagem: e.target.value }))} rows={6} required placeholder="Como podemos ajudar?" />
          <Button type="submit" size="lg" icon={Send} loading={loading}>Enviar mensagem</Button>
        </form>
      </div>
    </div>
  );
}

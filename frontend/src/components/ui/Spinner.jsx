import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Carregando...', fullPage = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-ink-500 ${fullPage ? 'min-h-[60vh]' : 'py-12'}`}>
      <Loader2 className="animate-spin text-brand-600" size={30} />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

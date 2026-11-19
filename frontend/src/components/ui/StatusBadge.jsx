import Badge from './Badge.jsx';

/** Exibe um status usando o mapa de domínio correspondente. */
export default function StatusBadge({ status, map, fallbackTone = 'neutral' }) {
  const config = map?.[status];
  const tone = config?.badge || fallbackTone;
  const label = config?.label || String(status ?? '—').replace(/_/g, ' ');
  return <Badge tone={tone}>{label}</Badge>;
}

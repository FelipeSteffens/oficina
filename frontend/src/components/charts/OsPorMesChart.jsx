import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { monthLabel, formatCurrency } from '../../utils/formatters.js';

export default function OsPorMesChart({ data = [] }) {
  const chartData = data.map((item) => ({
    ...item,
    label: monthLabel(item.mes),
  }));

  if (!chartData.length) {
    return <div className="flex h-64 items-center justify-center text-sm text-ink-500">Sem dados de atendimentos nos últimos 6 meses.</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(37,99,235,0.06)' }}
            contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,.08)' }}
            formatter={(value, name) => [name === 'faturamento' ? formatCurrency(value) : value, name === 'faturamento' ? 'Faturamento' : name === 'concluidas' ? 'Concluídas' : 'Atendimentos']}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#64748B' }} />
          <Bar dataKey="total" name="Atendimentos" fill="#1E56A0" radius={[6, 6, 0, 0]} maxBarSize={38} />
          <Bar dataKey="concluidas" name="Concluídas" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={38} opacity={0.45} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

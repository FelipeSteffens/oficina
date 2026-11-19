import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { OS_STATUS } from '../../utils/constants.js';

const COLORS = ['#2563EB', '#1E56A0', '#8B5CF6', '#10B981', '#EF4444'];

export default function StatusPieChart({ data = [] }) {
  const chartData = data.map((item) => ({
    name: OS_STATUS[item.status]?.label || item.status,
    value: Number(item.total),
  }));

  if (!chartData.length) {
    return <div className="flex h-56 items-center justify-center text-sm text-ink-500">Sem OS registradas.</div>;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3} stroke="none">
            {chartData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#64748B' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

import { Loader2 } from 'lucide-react';
import EmptyState from './EmptyState.jsx';

export default function Table({
  columns = [], data = [], loading = false, emptyTitle = 'Nenhum registro encontrado',
  emptyDescription, onRowClick, rowKey = 'id', dense = false,
}) {
  if (loading) {
    return (
      <div className="flex h-52 flex-col items-center justify-center gap-3 text-ink-500">
        <Loader2 className="animate-spin text-brand-600" size={28} />
        <p className="text-sm">Carregando dados...</p>
      </div>
    );
  }

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-surface-line">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`whitespace-nowrap px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-500 first:pl-0 last:pr-0 ${column.className || ''}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row[rowKey] ?? index}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-surface-line/70 transition last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-brand-50/60' : 'hover:bg-surface-soft'}`}
            >
              {columns.map((column) => (
                <td key={column.key} className={`px-3 align-middle first:pl-0 last:pr-0 ${dense ? 'py-2.5' : 'py-3.5'} ${column.className || ''}`}>
                  {column.render ? column.render(row) : row[column.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

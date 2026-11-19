import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate, formatDateTime, formatPlate } from './formatters.js';

const NAVY = [11, 25, 44];
const BLUE = [30, 86, 160];
const MUTED = [100, 116, 139];
const LINE = [226, 232, 240];

function baseDoc(title, subtitle) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setFillColor(...BLUE);
  doc.rect(0, 32, 210, 1.4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 14, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(subtitle, 14, 23);
  doc.setTextColor(30, 41, 59);
  return doc;
}

function footer(doc) {
  const height = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...LINE);
  doc.line(14, height - 16, 196, height - 16);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('AutoTrack Pro · Documento gerado digitalmente', 14, height - 11);
  doc.text(`Página ${doc.getCurrentPageInfo().pageNumber}`, 196, height - 11, { align: 'right' });
}

function infoTable(doc, rows, startY) {
  autoTable(doc, {
    startY,
    body: rows,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1.6, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: NAVY, cellWidth: 38 },
      1: { cellWidth: 62 },
      2: { fontStyle: 'bold', textColor: NAVY, cellWidth: 34 },
      3: { cellWidth: 62 },
    },
    margin: { left: 14, right: 14 },
  });
  return doc.lastAutoTable.finalY + 6;
}

function sectionTitle(doc, text, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(text, 14, y);
  doc.setDrawColor(...LINE);
  doc.line(14, y + 2, 196, y + 2);
  doc.setTextColor(30, 41, 59);
  return y + 7;
}

function textBlock(doc, label, text, y) {
  if (!text) return y;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(label, 14, y);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(String(text), 180);
  doc.text(lines, 14, y + 5);
  return y + 5 + lines.length * 4.6 + 3;
}

function save(doc, filename) {
  doc.save(filename.replace(/[^\w-]+/g, '_'));
}

export function downloadOsPdf(os) {
  const doc = baseDoc(
    `Ordem de Serviço #${os.id}`,
    `${os.oficina_nome || 'Oficina'} · Emitida em ${formatDateTime(new Date())}`,
  );

  let y = infoTable(doc, [
    ['Cliente', os.cliente_nome || '—', 'Status', os.status || '—'],
    ['Veículo', `${os.marca || ''} ${os.modelo || ''}`.trim() || '—', 'Placa', formatPlate(os.placa)],
    ['Mecânico', os.mecanico_nome || 'Não atribuído', 'Entrada', formatDateTime(os.data_entrada)],
    ['KM atual', `${os.quilometragem ?? 0} km`, 'Conclusão', formatDateTime(os.concluida_em)],
  ], 40);

  y = sectionTitle(doc, 'Diagnóstico e serviços', y);
  y = textBlock(doc, 'Problema relatado:', os.problema_relatado, y);
  y = textBlock(doc, 'Diagnóstico:', os.diagnostico, y);
  y = textBlock(doc, 'Serviços realizados:', os.servicos_realizados, y);

  if (os.pecas?.length) {
    y = sectionTitle(doc, 'Peças utilizadas', Math.max(y, 90));
    autoTable(doc, {
      startY: y,
      head: [['Peça', 'Código', 'Qtd.', 'Preço unit.', 'Subtotal']],
      body: os.pecas.map((p) => [
        p.peca_nome, p.peca_codigo || '—', p.quantidade,
        formatCurrency(p.preco_unitario), formatCurrency(p.quantidade * p.preco_unitario),
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: BLUE, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14, y, 182, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text('Valor total', 20, y + 9);
  doc.text(formatCurrency(os.valor_total), 190, y + 9, { align: 'right' });

  footer(doc);
  save(doc, `OS-${os.id}`);
}

export function downloadOrcamentoPdf(orcamento) {
  const doc = baseDoc(
    `Orçamento #${orcamento.id}`,
    `${orcamento.oficina_nome || 'Oficina'} · ${formatDate(orcamento.criado_em)}`,
  );

  let y = infoTable(doc, [
    ['Cliente', orcamento.cliente_nome || '—', 'Status', orcamento.status || '—'],
    ['Veículo', `${orcamento.marca || ''} ${orcamento.modelo || ''}`.trim() || '—', 'Placa', formatPlate(orcamento.placa)],
  ], 40);

  y = sectionTitle(doc, 'Descrição dos serviços', y);
  y = textBlock(doc, '', orcamento.descricao_servicos, y);

  autoTable(doc, {
    startY: y + 2,
    head: [['Tipo', 'Descrição', 'Qtd.', 'Valor unit.', 'Subtotal']],
    body: (orcamento.itens || []).map((item) => [
      item.tipo === 'peca' ? 'Peça' : 'Serviço',
      item.descricao,
      item.quantidade,
      formatCurrency(item.valor_unitario),
      formatCurrency(item.quantidade * item.valor_unitario),
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: BLUE, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 8;
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14, y, 182, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text('Total do orçamento', 20, y + 9);
  doc.text(formatCurrency(orcamento.valor_total), 190, y + 9, { align: 'right' });

  footer(doc);
  save(doc, `Orcamento-${orcamento.id}`);
}

export function downloadEstoquePdf(pecas, oficinaNome = 'Oficina') {
  const doc = baseDoc('Inventário de Estoque', `${oficinaNome} · ${formatDateTime(new Date())}`);
  autoTable(doc, {
    startY: 42,
    head: [['Código', 'Peça', 'Qtd.', 'Mín.', 'Preço unit.', 'Situação']],
    body: (pecas || []).map((p) => [
      p.codigo, p.nome, p.quantidade, p.estoque_minimo,
      formatCurrency(p.preco_unitario),
      Number(p.quantidade) <= Number(p.estoque_minimo) ? 'Estoque baixo' : 'Normal',
    ]),
    styles: { fontSize: 8.5, cellPadding: 2 },
    headStyles: { fillColor: BLUE, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });
  footer(doc);
  save(doc, 'Inventario-Estoque');
}

export function downloadHistoricoPdf({ veiculo, registros = [] }) {
  const placa = formatPlate(veiculo?.placa);
  const doc = baseDoc(
    'Histórico Digital do Veículo',
    `${veiculo?.marca || ''} ${veiculo?.modelo || ''} · ${placa} · ${formatDateTime(new Date())}`,
  );

  let y = infoTable(doc, [
    ['Proprietário', veiculo?.cliente_nome || '—', 'Placa', placa],
    ['Modelo', `${veiculo?.marca || ''} ${veiculo?.modelo || ''}`.trim(), 'Ano', veiculo?.ano || '—'],
    ['KM atual', `${veiculo?.quilometragem ?? 0} km`, 'Registros', registros.length],
  ], 40);

  for (const item of registros) {
    if (y > 235) {
      doc.addPage();
      y = 20;
    }
    y = sectionTitle(doc, `${formatDate(item.data_servico)} · ${item.oficina_nome || 'Oficina'} · OS #${item.os_id || '—'}`, y);
    y = textBlock(doc, `KM ${item.quilometragem} · Valor ${formatCurrency(item.valor_total)}`, '', y);
    y = textBlock(doc, 'Serviços:', item.servicos_realizados, y);
    y = textBlock(doc, 'Peças:', item.pecas_substituidas, y);
    y += 3;
  }

  footer(doc);
  save(doc, `Historico-${placa}`);
}

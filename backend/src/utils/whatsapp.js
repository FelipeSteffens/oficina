import { onlyDigits } from './formatters.js';

/** Gera link wa.me com DDI 55 e mensagem pré-preenchida. */
export function buildWhatsappLink(phone, message = '') {
  const digits = onlyDigits(phone);
  const ddi = digits.startsWith('55') && digits.length >= 12 ? '' : '55';
  const url = `https://wa.me/${ddi}${digits}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

export function appointmentMessage({ oficina, veiculo, data, horario }) {
  return `Olá! Confirmamos seu agendamento na ${oficina} para o veículo ${veiculo} no dia ${data} às ${horario}. Até breve!`;
}

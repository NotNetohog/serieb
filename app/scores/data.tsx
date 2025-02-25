import { Event } from 'app/sofascore';

// Componente otimizado para evitar problemas de hidratação
export function MatchStatus({ event }: { event: Event }) {

  if (event.status.type === 'finished' || event.status.type === 'inprogress') {
    return event.status.description
  } else {
    // Formatar a data apenas uma vez no cliente
    const timestampMs = event.startTimestamp < 10000000000
      ? event.startTimestamp * 1000
      : event.startTimestamp;

    const data = new Date(timestampMs);

    const formatted = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',

    }).format(data).replace(' às ', ', ');

    return formatted
  }
}


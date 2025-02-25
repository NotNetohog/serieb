'use client'

import { Event } from 'app/sofascore';
import { useEffect, useState } from 'react';

// Componente otimizado para evitar problemas de hidratação
export function MatchStatus({ event }: { event: Event }) {
  // Estado para armazenar a string formatada
  const [statusText, setStatusText] = useState<string>('');

  // Usar useEffect para garantir que a formatação ocorra apenas no cliente
  useEffect(() => {
    if (event.status.type === 'finished') {
      setStatusText('Finished');
    } else if (event.status.type === 'inprogress') {
      setStatusText(event.status.description);
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
        year: 'numeric',

      }).format(data).replace(' às ', ', ');

      setStatusText(formatted);
    }
  }, [event.status.type, event.status.description, event.startTimestamp]);

  // Renderizar um placeholder durante a hidratação
  if (!statusText) {
    return <span>Carregando...</span>;
  }

  return <span>{statusText}</span>;
}

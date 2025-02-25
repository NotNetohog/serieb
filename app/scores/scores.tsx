import { fetchRounds, Event, getTeamImageUrl } from 'app/sofascore';
import { MatchStatus } from './data';
import { cacheLife } from 'next/dist/server/use-cache/cache-life';

interface TeamDisplayProps {
  id: number;
  shortName: string;
  name: string;
  teamColors: {
    primary: string;
    text: string;
  };
  score?: number;
  isWinner?: boolean;
}

function TeamDisplay({ id, shortName, name, teamColors, score, isWinner }: TeamDisplayProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center group">
        <div className="relative w-8 h-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 mr-3 flex-shrink-0">
          <img
            src={getTeamImageUrl(id)}
            alt={name}
            sizes="32px"
            className="object-contain p-1"
          />
        </div>
        <span
          className={`font-medium transition-colors ${isWinner ? 'font-semibold' : ''
            }`}
          style={{
            color: isWinner ? `#${teamColors.primary}` : undefined
          }}
        >
          {shortName}
        </span>
      </div>
      {score !== undefined && (
        <span className={`text-lg font-semibold ${isWinner ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
          {score}
        </span>
      )}
    </div>
  );
}



function determineWinner(event: Event) {
  if (event.status.type !== 'finished') return { homeWinner: false, awayWinner: false };

  const homeScore = event.homeScore.current;
  const awayScore = event.awayScore.current;

  if (homeScore === undefined || awayScore === undefined) return { homeWinner: false, awayWinner: false };

  return {
    homeWinner: homeScore > awayScore,
    awayWinner: homeScore < awayScore
  };
}

export function EventCard({ event }: { event: Event }) {
  const { homeWinner, awayWinner } = determineWinner(event);
  const isLive = event.status.type === 'inprogress';

  return (
    <div className="p-4 mb-3 rounded-lg bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {event.tournament.name}
        </span>
        <span className={`text-xs font-medium ${isLive ? 'text-green-600 dark:text-green-400 animate-pulse' : 'text-gray-500 dark:text-gray-400'}`}>
          <MatchStatus event={event} />
        </span>
      </div>

      <div className="space-y-3">
        <TeamDisplay
          {...event.homeTeam}
          score={event.homeScore.current}
          isWinner={homeWinner}
        />
        <TeamDisplay
          {...event.awayTeam}
          score={event.awayScore.current}
          isWinner={awayWinner}
        />
      </div>
    </div>
  );
}

export async function Scores() {
  'use cache';
  cacheLife('max');

  const { events } = await fetchRounds(390, 72603, 1)

  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No matches found for this round.
      </div>
    );
  }

  return (
    <>
      <div className='py-4'>
        <h2 className="font-semibold text-lg">Próxima Rodada</h2>
        <h3 className="text-xs text-gray-600 dark:text-gray-400">
          {events[0].tournament.name}
        </h3>
      </div><div className="space-y-2">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </>

  );
}



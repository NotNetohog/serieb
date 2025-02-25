// components/StandingsTable.tsx
import clsx from 'clsx';
import { fetchStandings, getSimplifiedStandings } from 'app/sofascore';

interface TeamRowProps {
  position: number;
  teamColors: {
    primary: string;
    secondary: string;
    text: string;
  };
  wins: number;
  draws: number;
  losses: number;
  points: number;
  index: number;
  isLast: boolean;
  teamImageUrl: string;
  shortName: string;
  teamName: string;
  teamId: number;
  status?: string;
}

function TeamRow({
  position,
  teamColors,
  wins,
  draws,
  losses,
  points,
  index,
  isLast,
  teamImageUrl,
  shortName,
  teamName,
  teamId,
  status
}: TeamRowProps) {
  // Determine if the team is in a promotion or relegation zone
  const isPromotion = status?.toLowerCase().includes('promotion');
  const isRelegation = status?.toLowerCase().includes('relegation');

  return (
    <div
      className={clsx('flex items-center justify-between px-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded transition-colors', {
        'border-b border-gray-200 dark:border-gray-800': !isLast,
        'bg-green-50/50 dark:bg-green-900/10': isPromotion,
        'bg-red-50/50 dark:bg-red-900/10': isRelegation
      })}
    >
      <div className="flex items-center">
        <span className="w-6 text-center font-medium text-gray-500 dark:text-gray-400 mr-2">
          {position}
        </span>
        <div className="relative w-6 h-6 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <img
            src={teamImageUrl}
            alt={teamName}
            sizes="24px"
            className={clsx('object-contain p-0.5', {
              'dark:invert': teamColors.primary === '000000'
            })}
          />
        </div>
        <div
          className="font-medium ml-3  transition-colors"
        >
          {shortName}
        </div>


      </div>

      <div className="flex items-center space-x-4">
        <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="w-8 text-center">{wins}</span>
          <span className="w-8 text-center">{draws}</span>
          <span className="w-8 text-center">{losses}</span>
        </div>


        <span className="w-8 text-center font-semibold tabular-nums">
          {points}
        </span>
      </div>
    </div>
  );
}

async function StandingsTable({
  tournamentId = 390,
  seasonId = 72603,
  showHeader = true
}: {
  tournamentId?: number;
  seasonId?: number;
  showHeader?: boolean;
}) {
  // 'use cache';
  // cacheLife('max');

  const data = await fetchStandings(tournamentId, seasonId);
  const simplifiedStandings = getSimplifiedStandings(data);

  if (!simplifiedStandings.length) {
    return (
      <div className="text-center p-6 text-gray-500 dark:text-gray-400">
        No standings data available
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
      {showHeader && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative w-8 h-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <img
                src={`https://img.sofascore.com/api/v1/unique-tournament/${tournamentId}/image`}
                alt={data.standings[0].tournament.name}
                sizes="32px"
                className="object-contain p-1"
              />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Classificação</h2>
              <h3 className="text-xs text-gray-600 dark:text-gray-400">
                {data.standings[0].tournament.name}
              </h3>
            </div>
          </div>

          <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-8 text-center">V</span>
            <span className="w-8 text-center">E</span>
            <span className="w-8 text-center">D</span>
            <span className="w-8 text-center font-medium">PTS</span>
          </div>


        </div>
      )}

      <div className="p-2">
        {simplifiedStandings.map((team, index) => (
          <TeamRow
            key={team.teamId}
            index={index}
            isLast={index === simplifiedStandings.length - 1}
            {...team}
          />
        ))}
      </div>
    </div>
  );
}

export default function StandingsPage() {
  return (
    <section className="w-full mx-auto p-4">
      <StandingsTable />
    </section>
  );
}

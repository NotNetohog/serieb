// sofascore.ts
import path from 'node:path';
import fs from 'node:fs';

// Base types
export interface Country {
  alpha2: string;
  alpha3?: string;
  name: string;
  slug: string;
}

export interface Sport {
  name: string;
  slug: string;
  id: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  sport: Sport;
  flag: string;
  alpha2: string;
  country?: Country;
}

export interface Translation {
  [key: string]: string;
}

export interface FieldTranslations {
  nameTranslation: Record<string, string> | Translation;
  shortNameTranslation: Record<string, string> | Translation;
}

export interface TeamColors {
  primary: string;
  secondary: string;
  text: string;
}

// Tournament related types
export interface Tournament {
  name: string;
  slug: string;
  category: Category;
  uniqueTournament: UniqueTournament;
  priority: number;
  isGroup: boolean;
  isLive: boolean;
  id: number;
}

export interface UniqueTournament {
  name: string;
  slug: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  category: Category;
  userCount: number;
  hasPerformanceGraphFeature: boolean;
  hasEventPlayerStatistics?: boolean;
  id: number;
  country?: Record<string, never>;
  displayInverseHomeAwayTeams: boolean;
}

export interface Season {
  name: string;
  year: string;
  editor: boolean;
  id: number;
}

// Team related types
export interface Team {
  name: string;
  slug: string;
  shortName: string;
  gender: string;
  sport: Sport;
  userCount: number;
  nameCode: string;
  disabled?: boolean;
  national: boolean;
  type: number;
  id: number;
  country?: Country;
  entityType: string;
  subTeams?: any[];
  teamColors: TeamColors;
  fieldTranslations?: FieldTranslations;
}



// Standings related types
export interface TieBreakingRule {
  text: string;
  id: number;
}

export interface Promotion {
  text: string;
  id: number;
}

export interface StandingRow {
  team: Team;
  descriptions: any[];
  promotion?: Promotion;
  position: number;
  matches: number;
  wins: number;
  scoresFor: number;
  scoresAgainst: number;
  id: number;
  losses: number;
  draws: number;
  points: number;
  scoreDiffFormatted: string;
}


export interface Standing {
  tournament: Tournament;
  type: string;
  name: string;
  descriptions: any[];
  tieBreakingRule: TieBreakingRule;
  rows: StandingRow[];
  id: number;
  updatedAtTimestamp: number;
}



export interface StandingsResponse {
  standings: Standing[];
}



// Event related types
export interface RoundInfo {
  round: number;
}

export interface Status {
  code: number;
  description: string;
  type: string;
}

export interface Score {
  current?: number;
  period1?: number;
  period2?: number;
  normaltime?: number;
}

export interface Time {
  injuryTime1?: number;
  injuryTime2?: number;
  currentPeriodStartTimestamp?: number;
}

export interface Changes {
  changeTimestamp: number;
}

export interface Event {
  tournament: Tournament;
  season: Season;
  roundInfo: RoundInfo;
  customId: string;
  status: Status;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: Score;
  awayScore: Score;
  time: Time;
  changes: Changes;
  hasGlobalHighlights: boolean;
  crowdsourcingDataDisplayEnabled: boolean;
  id: number;
  startTimestamp: number;
  slug: string;
  finalResultOnly: boolean;
  feedLocked: boolean;
  isEditor: boolean;
}

export interface EventsResponse {
  events: Event[];
  hasNextPage: boolean;
}


/**
 * Generates the team image URL and caches the image locally
 * 
 * @param teamId - The team ID
 * @returns The path to the team's image (local cache or remote URL)
 */
export function getTeamImageUrl(teamId: number):string {
  const remoteUrl = `https://img.sofascore.com/api/v1/team/${teamId}/image`;
  const cacheDir = path.join(process.cwd(), 'public', 'img');
  const cacheFile = path.join(cacheDir, `team_${teamId}.png`);
  
  // Check if cached image exists
  if (fs.existsSync(cacheFile)) {
    // Return path to cached image
    return  path.join('/img', `team_${teamId}.png`);
  }

  return ""
  
  // Image doesn't exist in cache, fetch and save it
  // try {
  //   // Ensure directory exists
  //   if (!fs.existsSync(cacheDir)) {
  //     fs.mkdirSync(cacheDir, { recursive: true });
  //   }
    
  //   // Fetch the image
  //   const response = await fetch(remoteUrl);
    
  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch team image: ${response.status} ${response.statusText}`);
  //   }
    
  //   // Get image as buffer
  //   const imageBuffer = await response.arrayBuffer();
    
  //   // Save image to file
  //   fs.writeFileSync(cacheFile, Buffer.from(imageBuffer));
  //   console.log(`Team image saved to ${cacheFile}`);
    
  //   // Return path to cached image
  //   return  cacheFile;
  // } catch (error) {
  //   console.error(`Error fetching/caching team image for ID ${teamId}:`, error);
  //   // Return remote URL as fallback
  //   return remoteUrl;
  // }
}




/**
 * Fetches standings data from SofaScore API for a specific tournament and season
 * 
 * @param tournamentId - The unique tournament ID (e.g., 390 for Brasileirão Série B)
 * @param seasonId - The season ID (e.g., 72603 for 2025 season)
 * @returns Promise with the typed standings data
 */
export async function fetchStandings(
  tournamentId: number, 
  seasonId: number, 
): Promise<StandingsResponse> {
  try {
    // File path for cached data
    const cacheDir = path.join(process.cwd(), 'data', 'cache');
    const cacheFile = path.join(cacheDir, `standings_${tournamentId}_${seasonId}.json`);

    if (process.env.NODE_ENV === "development") {
      const response = await fetch(
        `https://www.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${seasonId}/standings/total`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          cache: 'no-store' // Ensures fresh data on each request
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch standings: ${response.status} ${response.statusText}`);
      }

      const data: StandingsResponse = await response.json();
      
      // Save data to file
      try {
        // Ensure directory exists
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }
        fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
        console.log(`Standings data saved to ${cacheFile}`);
      } catch (writeError) {
        console.error('Error saving standings data to file:', writeError);
      }
      return data;
    } else {
      // In production, read from cached file
        if (fs.existsSync(cacheFile)) {
          const fileData = fs.readFileSync(cacheFile, 'utf8');
          return JSON.parse(fileData) as StandingsResponse;
        } else {
          throw new Error(`Standings cache file not found: ${cacheFile}`);
        }
    }
  } catch (error) {
    console.error('Error fetching standings:', error);
    throw error;
  }
}

/**
 * Fetches event data from SofaScore API for a specific event
 * 
 * @param eventId - The event ID
 * @returns Promise with the event data
 */
async function fetchEventData(eventId: number): Promise<any> {
  
  // Fetch from API
  const response = await fetch(
    `https://www.sofascore.com/api/v1/event/${eventId}`,
    {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      cache: 'no-store'
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch event data: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return data;
}


/**
 * Helper function to get promotion/relegation status text for a team
 * 
 * @param standingRow - The standing row for a team
 * @returns The promotion/relegation status text or undefined
 */
export function getTeamStatus(standingRow: StandingRow ): string | undefined {
  return standingRow.promotion?.text;
}

/**
 * Extracts just the team standings in a simplified format
 * 
 * @param data - The full standings response
 * @returns An array of simplified team standings
 */
export function getSimplifiedStandings(
  data: StandingsResponse
): Array<{
  position: number;
  teamName: string;
  shortName: string;
  teamId: number;
  teamImageUrl: string;
  points: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: string;
  status?: string;
  teamColors: TeamColors;
}> {
  if (!data.standings || !data.standings[0] || !data.standings[0].rows) {
    return [];
  }

  return data.standings[0].rows.map( row => {

    return {
      position: row.position,
      teamName: row.team.name,
      shortName: row.team.shortName,
      teamId: row.team.id,
      teamImageUrl: getTeamImageUrl(row.team.id),
      points: row.points,
      matches: row.matches,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      goalsFor: row.scoresFor,
      goalsAgainst: row.scoresAgainst,
      goalDifference: row.scoreDiffFormatted,
      status: row.promotion?.text,
      teamColors: row.team.teamColors
    };
  });
}

/**
 * Fetches rounds data from SofaScore API for a specific tournament and season
 * 
 * @param tournamentId - The unique tournament ID (e.g., 390 for Brasileirão Série B)
 * @param seasonId - The season ID (e.g., 72603 for 2025 season)
 * @param round - The round number
 * @returns Promise with the typed rounds data
 */
export async function fetchRounds(
  tournamentId: number, 
  seasonId: number, 
  round: number
): Promise<EventsResponse> {
  try {
    // File path for cached data
    const cacheDir = path.join(process.cwd(), 'data', 'cache');
    const cacheFile = path.join(cacheDir, `round_${tournamentId}_${seasonId}_${round}.json`);

    if (process.env.NODE_ENV === "development") {
      const response = await fetch(
        `https://www.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${seasonId}/events/round/${round}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch rounds: ${response.status} ${response.statusText}`);
      }

      const data: EventsResponse = await response.json();
      
      // Save data to file
      try {
        // Ensure directory exists
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }
        fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
        console.log(`Data saved to ${cacheFile}`);
      } catch (writeError) {
        console.error('Error saving data to file:', writeError);
      }
      
      return data;
    } else {
      // In production, read from cached file
  
        if (fs.existsSync(cacheFile)) {
          const fileData = fs.readFileSync(cacheFile, 'utf8');
          return JSON.parse(fileData) as EventsResponse;
        } else {
          throw new Error(`Cache file not found: ${cacheFile}`);
        }
    }
  } catch (error) {
    console.error('Error fetching rounds:', error);
    throw error;
  }
}

// sofascore.ts
import round1 from 'app/static-data/rounds/1.json';
import standing1 from 'app/static-data/standings/1.json';

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

export interface TeamWithImage extends Team {
  imageUrl: string;
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

export interface StandingRowWithTeamImage extends Omit<StandingRow, 'team'> {
  team: TeamWithImage;
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

export interface StandingWithTeamImages extends Omit<Standing, 'rows'> {
  rows: StandingRowWithTeamImage[];
}

export interface StandingsResponse {
  standings: Standing[];
}

export interface StandingsResponseWithTeamImages {
  standings: StandingWithTeamImages[];
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

// Helper functions
/**
 * Generates the team image URL based on team ID
 * 
 * @param teamId - The team ID
 * @returns The full URL to the team's image
 */
export function getTeamImageUrl(teamId: number): string {
  return `https://img.sofascore.com/api/v1/team/${teamId}/image`;
}

/**
 * Fetches standings data from SofaScore API for a specific tournament and season
 * 
 * @param tournamentId - The unique tournament ID (e.g., 390 for Brasileirão Série B)
 * @param seasonId - The season ID (e.g., 72603 for 2025 season)
 * @param includeTeamImages - Whether to include team image URLs in the response
 * @returns Promise with the typed standings data
 */
export async function fetchStandings(
  tournamentId: number, 
  seasonId: number, 
  includeTeamImages = true
): Promise<StandingsResponse | StandingsResponseWithTeamImages> {
  try {

    if(process.env.NODE_ENV === "development"){
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
    
    if (includeTeamImages) {
      // Add image URLs to each team
      return {
        standings: data.standings.map(standing => ({
          ...standing,
          rows: standing.rows.map(row => ({
            ...row,
            team: {
              ...row.team,
              imageUrl: getTeamImageUrl(row.team.id)
            }
          }))
        }))
      } as StandingsResponseWithTeamImages;
    }
    
    return data;

  }

  const data =  standing1 as StandingsResponse

  return data

  } catch (error) {
    console.error('Error fetching standings:', error);
    throw error;
  }
}

/**
 * Helper function to get promotion/relegation status text for a team
 * 
 * @param standingRow - The standing row for a team
 * @returns The promotion/relegation status text or undefined
 */
export function getTeamStatus(standingRow: StandingRow | StandingRowWithTeamImage): string | undefined {
  return standingRow.promotion?.text;
}

/**
 * Extracts just the team standings in a simplified format
 * 
 * @param data - The full standings response
 * @returns An array of simplified team standings
 */
export function getSimplifiedStandings(
  data: StandingsResponse | StandingsResponseWithTeamImages
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

  return data.standings[0].rows.map(row => {
    const teamHasImage = 'imageUrl' in row.team;
    
    return {
      position: row.position,
      teamName: row.team.name,
      shortName: row.team.shortName,
      teamId: row.team.id,
      teamImageUrl: teamHasImage 
        ? (row.team as TeamWithImage).imageUrl 
        : getTeamImageUrl(row.team.id),
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
 * Fetch a single team's image
 * 
 * @param teamId - The team ID to fetch the image for
 * @returns The URL to the team image
 */
export async function fetchTeamImage(teamId: number): Promise<string> {
  const imageUrl = getTeamImageUrl(teamId);
  
  try {
    // We just check if the image exists by making a HEAD request
    const response = await fetch(imageUrl, {
      method: 'HEAD',
      cache: 'force-cache' // Cache team logos as they rarely change
    });
    
    if (!response.ok) {
      console.warn(`Team image not found for ID ${teamId}`);
      return ''; // Return empty string if image doesn't exist
    }
    
    return imageUrl;
  } catch (error) {
    console.error(`Error checking team image for ID ${teamId}:`, error);
    return imageUrl; // Return the URL anyway, let the client handle missing images
  }
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

    if(process.env.NODE_ENV === "development"){
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
    return data;
  }

  const data = round1 as EventsResponse

  return data


  } catch (error) {
    console.error('Error fetching rounds:', error);
    throw error;
  }
}

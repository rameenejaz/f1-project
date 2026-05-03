/** Fallback when API is offline — shape matches `api.js` responses */

export const mockTeams = [
  {
    id: 1,
    name: 'Oracle Red Bull Racing',
    color: '#1E41FF',
    founded_year: 2005,
    chassis: 'RB20',
  },
  {
    id: 2,
    name: 'Mercedes-AMG PETRONAS F1 Team',
    color: '#00D2BE',
    founded_year: 2010,
    chassis: 'W15',
  },
  {
    id: 3,
    name: 'Scuderia Ferrari',
    color: '#E1062E',
    founded_year: 1950,
    chassis: 'SF-24',
  },
];

export const mockDrivers = [
  {
    id: 1,
    name: 'Max Verstappen',
    team_id: 1,
    team: 'Oracle Red Bull Racing',
    color: '#1E41FF',
    nationality: 'Dutch',
    start_year: 2015,
    performance_score: 98,
    role: 'Race Driver',
  },
  {
    id: 2,
    name: 'Sergio Pérez',
    team_id: 1,
    team: 'Oracle Red Bull Racing',
    color: '#1E41FF',
    nationality: 'Mexican',
    start_year: 2011,
    performance_score: 86,
    role: 'Race Driver',
  },
  {
    id: 3,
    name: 'Lewis Hamilton',
    team_id: 2,
    team: 'Mercedes-AMG PETRONAS F1 Team',
    color: '#00D2BE',
    nationality: 'British',
    start_year: 2007,
    performance_score: 96,
    role: 'Race Driver',
  },
  {
    id: 4,
    name: 'George Russell',
    team_id: 2,
    team: 'Mercedes-AMG PETRONAS F1 Team',
    color: '#00D2BE',
    nationality: 'British',
    start_year: 2019,
    performance_score: 90,
    role: 'Race Driver',
  },
  {
    id: 5,
    name: 'Charles Leclerc',
    team_id: 3,
    team: 'Scuderia Ferrari',
    color: '#E1062E',
    nationality: 'Monegasque',
    start_year: 2018,
    performance_score: 93,
    role: 'Race Driver',
  },
  {
    id: 6,
    name: 'Carlos Sainz Jr.',
    team_id: 3,
    team: 'Scuderia Ferrari',
    color: '#E1062E',
    nationality: 'Spanish',
    start_year: 2015,
    performance_score: 91,
    role: 'Race Driver',
  },
];

export const racesPerMonth = [
  { month: 'Jan', races: 0 },
  { month: 'Feb', races: 0 },
  { month: 'Mar', races: 3 },
  { month: 'Apr', races: 4 },
  { month: 'May', races: 5 },
  { month: 'Jun', races: 9 },
  { month: 'Jul', races: 6 },
  { month: 'Aug', races: 5 },
  { month: 'Sep', races: 7 },
  { month: 'Oct', races: 6 },
  { month: 'Nov', races: 5 },
  { month: 'Dec', races: 1 },
];

export const performanceTrend = [
  { label: 'R1', score: 82 },
  { label: 'R2', score: 78 },
  { label: 'R3', score: 85 },
  { label: 'R4', score: 88 },
  { label: 'R5', score: 84 },
  { label: 'R6', score: 90 },
  { label: 'R7', score: 87 },
  { label: 'R8', score: 91 },
];

/** Hero vertical stats keyed by team id */
export const heroStatsByTeamId = {
  1: { championships: 6, wins: 118, performance: 96 },
  2: { championships: 8, wins: 125, performance: 92 },
  3: { championships: 16, wins: 243, performance: 94 },
};

export const actionTiles = [
  { id: 'start', label: 'Start', icon: 'key', accent: true },
  { id: 'drive', label: 'Drive', icon: 'wheel' },
  { id: 'maint', label: 'Maintenance', icon: 'gear' },
  { id: 'battery', label: 'Battery', icon: 'battery' },
  { id: 'tires', label: 'Tires', icon: 'disc' },
  { id: 'lock', label: 'Lock', icon: 'lock', accent: true },
];

export interface Graphic {
  name: string;
  file: string;
  file_url?: string;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  avatar_url?: string;
  admin: boolean;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  logo_url?: string;
}

export interface Driver {
  id: string;
  firstname: string;
  lastname: string;
  code: string;
  headshot: string;
  headshot_url?: string;
  team: string;
  active: boolean;
}

export interface Race {
  id: string;
  name: string;
  step: number;
  pictogram: string;
  pictogram_url?: string;
  pxx: number;
  sprintqualidate: string;
  sprintdate: string;
  qualidate: string;
  racedate: string;
}

export interface Substitution {
  id: string;
  substitute: string;
  for: string;
  race: string;
}

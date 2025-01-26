// NOTE: The "expand" fields might be undefined.
//       I'm not using "expand?" because I won't check for undefined anyways.

// Application Data

export interface Graphic {
  name: string;
  file: string;
  file_url?: string;
}

export interface User {
  id: string;
  username: string;
  firstname: string;
  avatar: string;
  avatar_url?: string;
  admin: boolean;
}

// Season Data

export interface Team {
  id: string;
  name: string;
  banner: string;
  banner_url?: string;
  logo: string;
  logo_url?: string;
  color: string;
}

export interface Driver {
  id: string;
  code: string;
  firstname: string;
  lastname: string;
  headshot: string;
  headshot_url?: string;
  team: string;
  active: boolean;
  expand: {
    team: Team;
  };
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
  expand: {
    race: Race;
  };
}

// User Data

export interface RacePick {
  id: string;
  user: string;
  race: string;
  pxx?: string;
  dnf?: string;
  expand: {
    dnf: Driver;
    pxx: Driver;
    race: Race;
    user: User;
  };
}

export interface RaceResult {
  id: string;
  race: string;
  pxxs: string[];
  dnfs: string[];
  expand: {
    dnfs: Driver[];
    pxxs: Driver[];
    race: Race;
  };
}

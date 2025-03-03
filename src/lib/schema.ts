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
  avatar?: string;
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
    user: User;
  };
}

export interface SeasonPick {
  id: string;
  user: string;
  hottake: string;
  wdcwinner: string;
  wccwinner: string;
  mostovertakes: string;
  mostdnfs: string;
  doohanstarts: number;
  teamwinners: string[];
  podiums: string[];
  expand: {
    user: User;
  };
}

export interface Hottake {
  id: string;
  user: string;
  hottake: string;
}

export interface RaceResult {
  id: string;
  race: string;
  pxxs: string[];
  dnfs: string[];
}

export interface CurrentPickedUser {
  id: string;
  username: string;
  firstname: string;
  avatar: string;
  avatar_url?: string;
  admin: boolean;
  picked: string | null;
}

export interface SeasonPickedUser {
  id: string;
  username: string;
  firstname: string;
  avatar: string;
  avatar_url?: string;
  admin: boolean;
  picked: string | null;
}

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

export interface Race {}

export interface Substitution {}

// Many aspect ratios are predefined here.
// This is terrible, since they need to be updated if the HTML changes.
// I tried to determine these dynamically by loading a "sample" element
// and measuring its width/height, but this was not reliable:
// When changing the viewport size, measured heights were no longer accurate.

// Image aspect ratios
export const AVATAR_WIDTH: number = 256;
export const AVATAR_HEIGHT: number = 256;

export const TEAM_BANNER_WIDTH: number = 512;
export const TEAM_BANNER_HEIGHT: number = 288;

export const TEAM_LOGO_WIDTH: number = 96;
export const TEAM_LOGO_HEIGHT: number = 96;

export const DRIVER_HEADSHOT_WIDTH: number = 512;
export const DRIVER_HEADSHOT_HEIGHT: number = 512;

export const RACE_PICTOGRAM_WIDTH: number = 512;
export const RACE_PICTOGRAM_HEIGHT: number = 384;

// Card aspect ratios
// export const TEAM_CARD_ASPECT_WIDTH: number = 413;
// export const TEAM_CARD_ASPECT_HEIGHT: number = 438;

// export const DRIVER_CARD_ASPECT_WIDTH: number = 411;
// export const DRIVER_CARD_ASPECT_HEIGHT: number = 769;

// export const RACE_CARD_ASPECT_WIDTH: number = 497;
// export const RACE_CARD_ASPECT_HEIGHT: number = 879;

// export const SUBSTITUTION_CARD_ASPECT_WIDTH: number = 413;
// export const SUBSTITUTION_CARD_ASPECT_HEIGHT: number = 625;

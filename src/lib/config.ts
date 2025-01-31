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

// Define the background colors the picks will have depending on the raceresult
export const PXX_COLORS: string[] = [];
PXX_COLORS[-1] = "auto";
PXX_COLORS[0] = "#C2FBCC"; // 1 Point
PXX_COLORS[6] = "#C2FBCC";
PXX_COLORS[1] = "#6CDB7E"; // 3 Points
PXX_COLORS[5] = "#6CDB7E";
PXX_COLORS[2] = "#07B725"; // 6 Points
PXX_COLORS[4] = "#07B725";
PXX_COLORS[3] = "#EFBF04"; // 10 Points

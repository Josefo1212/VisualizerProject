export interface Rgb { r: number; g: number; b: number; }
export interface SkyPt { h: number; top: Rgb; mid: Rgb; bot: Rgb; }

export const SKY_PTS: SkyPt[] = [
  { h: 0,  top: { r: 7, g: 7, b: 20 },   mid: { r: 13, g: 13, b: 43 },  bot: { r: 10, g: 10, b: 26 } },
  { h: 5,  top: { r: 15, g: 10, b: 35 },  mid: { r: 35, g: 20, b: 70 },  bot: { r: 22, g: 15, b: 52 } },
  { h: 6,  top: { r: 255, g: 154, b: 158 }, mid: { r: 250, g: 208, b: 196 }, bot: { r: 161, g: 196, b: 253 } },
  { h: 7,  top: { r: 200, g: 170, b: 220 }, mid: { r: 180, g: 200, b: 240 }, bot: { r: 100, g: 180, b: 240 } },
  { h: 9,  top: { r: 100, g: 180, b: 255 }, mid: { r: 79, g: 172, b: 254 },  bot: { r: 0, g: 242, b: 254 } },
  { h: 12, top: { r: 30, g: 144, b: 255 }, mid: { r: 79, g: 172, b: 254 },  bot: { r: 0, g: 242, b: 254 } },
  { h: 15, top: { r: 79, g: 172, b: 254 }, mid: { r: 135, g: 206, b: 235 }, bot: { r: 200, g: 180, b: 100 } },
  { h: 17, top: { r: 255, g: 144, b: 104 }, mid: { r: 240, g: 152, b: 25 },  bot: { r: 255, g: 211, b: 165 } },
  { h: 18, top: { r: 255, g: 75, b: 31 },  mid: { r: 255, g: 100, b: 60 },   bot: { r: 199, g: 125, b: 94 } },
  { h: 19, top: { r: 140, g: 50, b: 40 },  mid: { r: 74, g: 14, b: 78 },    bot: { r: 26, g: 26, b: 62 } },
  { h: 20, top: { r: 7, g: 7, b: 20 },    mid: { r: 13, g: 13, b: 43 },    bot: { r: 10, g: 10, b: 26 } },
];

import { accountHelp } from "./account-help";
import { androidApp } from "./android-app";
import { depositWithdraw } from "./deposit-withdraw";
import { footballPageGuide } from "./football-page-guide";
import { footballSchedule } from "./football-schedule";
import { iphoneHomeScreen } from "./iphone-home-screen";
import { lobbyGuide } from "./lobby-guide";
import { playOnMobile } from "./play-on-mobile";
import { fishingAndCardGames } from "./fishing-and-card-games";
import { casinoCardProviders } from "./casino-card-providers";
import { gameCategories } from "./game-categories";
import { gameProviders } from "./game-providers";
import { liveCasino } from "./live-casino";
import { responsiblePlay } from "./responsible-play";
import { slotGames } from "./slot-games";
import { slotProviders } from "./slot-providers";
import type { Guide } from "./types";

/** every published guide, in reading order */
export const GUIDES: Guide[] = [
  gameCategories,
  slotGames,
  liveCasino,
  fishingAndCardGames,
  gameProviders,
  slotProviders,
  casinoCardProviders,
  playOnMobile,
  lobbyGuide,
  androidApp,
  iphoneHomeScreen,
  footballSchedule,
  footballPageGuide,
  accountHelp,
  depositWithdraw,
  responsiblePlay,
];

const BY_SLUG = new Map(GUIDES.map((g) => [g.slug, g]));
export const guideBySlug = (slug: string) => BY_SLUG.get(slug);

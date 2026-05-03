export { HomeBuildFooter } from './components/home-build-footer';
export { HomeHero } from './components/home-hero';
export { HomeRecentProjects } from './components/home-recent-projects';
export { HomeReleaseSummary } from './components/home-release-summary';
export { HomeSkeleton } from './components/home-skeleton';
export { HomeTemplateGroup } from './components/home-template-group';
export { useHome } from './home-context';
export { loadHomeData } from './home-data';
export { HomePage } from './home-page';
export { HomeProvider } from './home-provider';

import { HomeBuildFooter } from './components/home-build-footer';
import { HomeHero } from './components/home-hero';
import { HomeRecentProjects } from './components/home-recent-projects';
import { HomeReleaseSummary } from './components/home-release-summary';
import { HomeSkeleton } from './components/home-skeleton';
import { HomeTemplateGroup } from './components/home-template-group';
import { HomePage } from './home-page';
import { HomeProvider } from './home-provider';

export const Home = {
  Provider: HomeProvider,
  Page: HomePage,
  Hero: HomeHero,
  TemplateGroup: HomeTemplateGroup,
  RecentProjects: HomeRecentProjects,
  ReleaseSummary: HomeReleaseSummary,
  BuildFooter: HomeBuildFooter,
  Skeleton: HomeSkeleton,
};

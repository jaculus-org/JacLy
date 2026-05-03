import { m } from '@/core/paraglide/messages';
import { HomeBuildFooter } from './components/home-build-footer';
import { HomeHero } from './components/home-hero';
import { HomeRecentProjects } from './components/home-recent-projects';
import { HomeReleaseSummary } from './components/home-release-summary';
import { HomeTemplateGroup } from './components/home-template-group';
import { useHome } from './home-context';

export function HomePage() {
  const { state, meta } = useHome();

  return (
    <div className="space-y-8 py-8">
      <HomeHero />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.7fr)]">
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {m.index_template_section_title()}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{m.index_template_section_desc()}</p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <HomeTemplateGroup
              type="jacly"
              title={m.index_template_blocks_title()}
              templates={state.jaclyTemplates}
              templatesAvailable={meta.templatesAvailable}
            />
            <HomeTemplateGroup
              type="code"
              title={m.index_template_code_title()}
              templates={state.codeTemplates}
              templatesAvailable={meta.templatesAvailable}
            />
          </div>
        </section>

        <HomeReleaseSummary />
      </div>

      <HomeRecentProjects />
      <HomeBuildFooter />
    </div>
  );
}

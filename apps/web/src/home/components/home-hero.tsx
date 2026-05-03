import { Link } from '@tanstack/react-router';
import { BlocksIcon, Code2Icon, FolderOpen, PlusCircleIcon } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Button, PageHero } from '@/ui';

export function HomeHero() {
  return (
    <PageHero
      className="border-primary/20 bg-[radial-gradient(circle_at_12%_12%,color-mix(in_oklab,var(--primary)_24%,transparent),transparent_30%),radial-gradient(circle_at_82%_18%,color-mix(in_oklab,var(--chart-2)_18%,transparent),transparent_28%),linear-gradient(135deg,color-mix(in_oklab,var(--card)_86%,var(--primary)_14%)_0%,color-mix(in_oklab,var(--card)_92%,var(--secondary)_8%)_48%,color-mix(in_oklab,var(--card)_88%,var(--accent)_12%)_100%)] lg:px-10 dark:border-primary/25 dark:bg-[radial-gradient(circle_at_12%_12%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_32%),radial-gradient(circle_at_82%_18%,color-mix(in_oklab,var(--chart-2)_16%,transparent),transparent_30%),linear-gradient(135deg,color-mix(in_oklab,var(--card)_88%,var(--primary)_12%)_0%,var(--card)_52%,color-mix(in_oklab,var(--card)_82%,var(--secondary)_18%)_100%)]"
      title={m.index_hero_title()}
      description={m.index_hero_description()}
      actions={
        <>
          <Button asChild size="lg" variant="cta">
            <Link to="/project/new" search={{ type: 'jacly' }}>
              <PlusCircleIcon className="size-4.5" />
              {m.index_primary_cta()}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border bg-card/80 text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card"
          >
            <Link to="/project">
              <FolderOpen className="size-4.5" />
              {m.index_secondary_cta()}
            </Link>
          </Button>
        </>
      }
      sideContent={
        <>
          <div className="rounded-2xl border border-primary/20 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_76%,var(--primary)_24%),color-mix(in_oklab,var(--card)_90%,var(--secondary)_10%))] p-4 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.12)] backdrop-blur dark:border-primary/25 dark:bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_78%,var(--primary)_22%),color-mix(in_oklab,var(--card)_88%,var(--secondary)_12%))] dark:shadow-[0_12px_32px_-24px_rgba(0,0,0,0.4)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-project-jacly-background p-2 text-project-jacly">
                <BlocksIcon className="size-5" />
              </div>
              <div>
                <div className="font-medium text-foreground">{m.index_blocks_title()}</div>
                <p className="text-sm text-muted-foreground">{m.index_blocks_desc()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_78%,var(--chart-2)_22%),color-mix(in_oklab,var(--card)_90%,var(--secondary)_10%))] p-4 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.12)] backdrop-blur dark:border-primary/25 dark:bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_82%,var(--chart-2)_18%),color-mix(in_oklab,var(--card)_88%,var(--secondary)_12%))] dark:shadow-[0_12px_32px_-24px_rgba(0,0,0,0.4)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-project-code-background p-2 text-project-code">
                <Code2Icon className="size-5" />
              </div>
              <div>
                <div className="font-medium text-foreground">{m.index_typescript_title()}</div>
                <p className="text-sm text-muted-foreground">{m.index_typescript_desc()}</p>
              </div>
            </div>
          </div>
        </>
      }
    />
  );
}

import { Link } from '@tanstack/react-router';
import { BlocksIcon, Code2Icon, FolderOpen, PlusCircleIcon } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Button, PageHero } from '@/ui';

export function HomeHero() {
  return (
    <PageHero
      className="lg:px-10"
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
          <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.12)] backdrop-blur dark:shadow-[0_12px_32px_-24px_rgba(0,0,0,0.4)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <BlocksIcon className="size-5" />
              </div>
              <div>
                <div className="font-medium text-foreground">{m.index_blocks_title()}</div>
                <p className="text-sm text-muted-foreground">{m.index_blocks_desc()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.12)] backdrop-blur dark:shadow-[0_12px_32px_-24px_rgba(0,0,0,0.4)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
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

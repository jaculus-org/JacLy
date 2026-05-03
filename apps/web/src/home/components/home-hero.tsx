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
      topSlot={
        <div className="inline-flex items-center gap-3 rounded-full border border-sky-200/85 bg-white/78 px-3 py-2 text-sm text-slate-700 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
          <img src="/favicon/favicon.svg" alt="JacLy" className="h-5 w-5 shrink-0" />
          <span className="font-medium tracking-tight">JacLy</span>
        </div>
      }
      actions={
        <>
          <Button
            asChild
            size="lg"
            className="bg-slate-950 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_14px_32px_-18px_rgba(15,23,42,0.45)] dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200 dark:hover:shadow-[0_14px_30px_-18px_rgba(226,232,240,0.18)]"
          >
            <Link to="/project/new" search={{ type: 'jacly' }}>
              <PlusCircleIcon className="size-4.5" />
              {m.index_primary_cta()}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-sky-200/85 bg-white/76 text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white hover:shadow-[0_14px_32px_-20px_rgba(14,30,63,0.26)] dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:hover:border-sky-900 dark:hover:bg-slate-900 dark:hover:shadow-[0_14px_28px_-20px_rgba(2,6,23,0.8)]"
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
          <div className="rounded-2xl border border-sky-200/80 bg-white/72 p-4 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.24)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <BlocksIcon className="size-5" />
              </div>
              <div>
                <div className="font-medium text-slate-950 dark:text-slate-50">
                  {m.index_blocks_title()}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {m.index_blocks_desc()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-200/80 bg-white/72 p-4 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.24)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Code2Icon className="size-5" />
              </div>
              <div>
                <div className="font-medium text-slate-950 dark:text-slate-50">
                  {m.index_typescript_title()}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {m.index_typescript_desc()}
                </p>
              </div>
            </div>
          </div>
        </>
      }
    />
  );
}

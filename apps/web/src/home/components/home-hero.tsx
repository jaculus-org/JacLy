import { Link } from '@tanstack/react-router';
import { BlocksIcon, Code2Icon, FolderOpen, PlusCircleIcon } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Button } from '@/ui';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-sky-200/75 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_78%_22%,_rgba(45,212,191,0.12),_transparent_26%),linear-gradient(180deg,_rgba(244,249,255,0.98),_rgba(232,241,252,0.96))] px-6 py-8 shadow-[0_28px_80px_-52px_rgba(14,30,63,0.28)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_78%_22%,_rgba(16,185,129,0.14),_transparent_28%),linear-gradient(180deg,_rgba(2,6,23,0.95),_rgba(15,23,42,0.92))] sm:px-8 sm:py-10 lg:px-10">
      <div className="absolute inset-y-0 right-0 hidden w-1/3 border-l border-sky-100/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.22),_rgba(191,219,254,0.05))] lg:block dark:border-slate-800/70 dark:bg-[linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.01))]" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:items-end">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-sky-200/85 bg-white/78 px-3 py-2 text-sm text-slate-700 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
            <img src="/favicon/favicon.svg" alt="JacLy" className="h-5 w-5 shrink-0" />
            <span className="font-medium tracking-tight">JacLy</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-slate-50">
              {m.index_hero_title()}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-700 sm:text-lg dark:text-slate-300">
              {m.index_hero_description()}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-slate-950 text-white shadow-sm hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200"
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
              className="border-sky-200/85 bg-white/76 text-slate-800 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <Link to="/project">
                <FolderOpen className="size-4.5" />
                {m.index_secondary_cta()}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
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
        </div>
      </div>
    </section>
  );
}

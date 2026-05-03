import { Link } from '@tanstack/react-router';
import { FolderPlus, Import } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Button, PageHero } from '@/ui';

export function ProjectIndexHeader() {
  return (
    <PageHero
      title={m.project_title()}
      description={m.project_subtitle()}
      titleClassName="lg:text-5xl"
      actions={
        <>
          <Button
            asChild
            size="lg"
            className="bg-slate-950 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_14px_32px_-18px_rgba(15,23,42,0.45)] dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200 dark:hover:shadow-[0_14px_30px_-18px_rgba(226,232,240,0.18)]"
          >
            <Link to="/project/new">
              <FolderPlus className="size-4.5" />
              {m.project_btn_create()}
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-sky-200/85 bg-white/76 text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white hover:shadow-[0_14px_32px_-20px_rgba(14,30,63,0.26)] dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:hover:border-sky-900 dark:hover:bg-slate-900 dark:hover:shadow-[0_14px_28px_-20px_rgba(2,6,23,0.8)]"
          >
            <Link to="/project/import">
              <Import className="size-4.5" />
              {m.project_btn_import()}
            </Link>
          </Button>
        </>
      }
    />
  );
}

import { Link } from '@tanstack/react-router';
import { FolderPlus, Import } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Button, PageHero } from '@/ui';

export function ProjectIndexHeader() {
  return (
    <PageHero
      title={m.project_title()}
      titleClassName="lg:text-5xl"
      actions={
        <>
          <Button asChild size="lg" variant="cta">
            <Link to="/project/new">
              <FolderPlus className="size-4.5" />
              {m.project_btn_create()}
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border bg-card/80 text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card"
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

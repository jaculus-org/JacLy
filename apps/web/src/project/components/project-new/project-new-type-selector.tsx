import type { JaculusProjectType } from '@jaculus/project/package';
import { BlocksIcon, CheckCircle, Code2Icon, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import { m } from '@/core/paraglide/messages';
import { ProjectFormSection } from '@/ui';
import { useProjectNew } from './project-new-context';

interface TypeOption {
  type: JaculusProjectType;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
}

export function ProjectNewTypeSelector() {
  const { state, actions } = useProjectNew();

  const options = useMemo<TypeOption[]>(
    () => [
      {
        type: 'jacly',
        title: m.project_new_blocks_title(),
        description: m.project_new_blocks_desc(),
        icon: BlocksIcon,
        iconClassName: 'bg-project-jacly-background text-project-jacly',
      },
      {
        type: 'code',
        title: m.project_new_code_title(),
        description: m.project_new_code_desc(),
        icon: Code2Icon,
        iconClassName: 'bg-project-code-background text-project-code',
      },
    ],
    [],
  );

  return (
    <ProjectFormSection title={m.project_new_type_title()}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = state.projectType === option.type;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => actions.selectType(option.type)}
              className={`group relative rounded-xl border p-5 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary/60 bg-primary/8 shadow-[0_8px_28px_-16px_rgba(37,150,228,0.25)]'
                  : 'border-border bg-card hover:-translate-y-0.5 hover:border-primary/40'
              }`}
            >
              {isSelected && (
                <span className="absolute right-3 top-3">
                  <CheckCircle className="size-5 text-primary" />
                </span>
              )}
              <div className="flex items-start gap-3 pr-8">
                <div className={`shrink-0 rounded-xl p-2.5 ${option.iconClassName}`}>
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">{option.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ProjectFormSection>
  );
}

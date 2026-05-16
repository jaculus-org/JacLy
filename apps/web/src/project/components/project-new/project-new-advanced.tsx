import { m } from '@/core/paraglide/messages';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/components/accordion';
import { Input } from '@/ui/components/input';
import { useProjectNew } from './project-new-context';

export function ProjectNewAdvanced() {
  const { state, actions } = useProjectNew();

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="advanced"
        className="rounded-2xl border border-dashed border-border bg-muted/40"
      >
        <AccordionTrigger className="px-4 py-3 text-sm font-medium text-muted-foreground hover:no-underline">
          {m.project_new_advanced()}
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-3">
            <div>
              <label
                htmlFor="defaultRegisters"
                className="mb-1.5 block text-sm font-medium text-muted-foreground"
              >
                {m.project_new_default_registers()}
              </label>
              <Input
                id="defaultRegisters"
                value={state.registers.join('; ')}
                onChange={(e) => {
                  actions.setRegisters(e.target.value.split(';').map((s) => s.trim()));
                }}
                className="text-sm"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {m.project_new_default_registers_hint()}
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

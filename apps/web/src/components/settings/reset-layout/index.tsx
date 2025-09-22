import { Button } from '@/components/ui/button';
// import { useFlexLayout } from "@/providers/flexlayout-provider";
import { useIntlayer } from 'react-intlayer';

export function ResetLayout() {
  const content = useIntlayer('reset-layout');
  // const { resetLayout } = useFlexLayout();

  return (
    <>
      <Button
        // onClick={() => resetLayout()}
        variant="outline"
        size={'sm'}
      >
        {content.resetLayout}
      </Button>
      <p className="text-sm text-muted-foreground">
        {content.resetLayoutDescription}
      </p>
    </>
  );
}

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLocale } from '@/core/paraglide/runtime';
import { csDocModules, enDocModules } from './docs-config';

interface DocMod {
  html: string;
  raw: string;
}

interface Props {
  page: string;
}

function CopyButton({ raw }: { raw: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy markdown"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {copied ? (
        <>
          <Check className="size-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          Copy MD
        </>
      )}
    </button>
  );
}

export function DocsPage({ page }: Props) {
  const [doc, setDoc] = useState<DocMod | null>(null);
  const [notFound, setNotFound] = useState(false);
  const locale = getLocale();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const csKey = `/docs/${page}.cs.md`;
      const enKey = `/docs/${page}.md`;

      const loader =
        locale === 'cs' && csDocModules[csKey] ? csDocModules[csKey] : enDocModules[enKey];

      if (!loader) {
        if (!cancelled) setNotFound(true);
        return;
      }

      const mod = (await loader()) as DocMod;
      if (!cancelled) {
        setDoc(mod);
        setNotFound(false);
      }
    };

    setDoc(null);
    setNotFound(false);
    load();

    return () => {
      cancelled = true;
    };
  }, [page, locale]);

  if (notFound) {
    return <p className="py-8 text-muted-foreground">Page not found.</p>;
  }

  if (doc === null) {
    return <div className="animate-pulse py-8 text-muted-foreground">Loading…</div>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <CopyButton raw={doc.raw} />
      </div>
      <article
        className="prose prose-neutral dark:prose-invert max-w-none p-4 rounded-lg shadow-md bg-card"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: content is generated from trusted local markdown files at build time
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />
    </div>
  );
}

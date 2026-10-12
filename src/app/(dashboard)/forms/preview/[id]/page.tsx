import { Suspense } from 'react';
import FormPreviewClient from './FormPreviewClient';
import { Loader2 } from 'lucide-react';

export default async function FormPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2 font-sans">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Loading digital form renderer...</span>
        </div>
      }
    >
      <FormPreviewClient id={id} />
    </Suspense>
  );
}

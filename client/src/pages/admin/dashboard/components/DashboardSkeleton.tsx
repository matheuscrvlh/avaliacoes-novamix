interface DashboardSkeletonProps {
  mostrarLojas: boolean;
}

const bloco = "animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700";

export function DashboardSkeleton({ mostrarLojas }: DashboardSkeletonProps) {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Carregando avaliações...</span>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${bloco} h-24`} />
        ))}
      </div>

      {mostrarLojas && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${bloco} h-36`} />
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
        <div className={`${bloco} h-28`} />
      </div>

      <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 space-y-3">
        <div className={`${bloco} h-9 w-full sm:w-2/3`} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`${bloco} h-12`} />
        ))}
      </div>
    </div>
  );
}

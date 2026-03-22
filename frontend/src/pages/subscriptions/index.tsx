import { SubscriptionHeader } from "./components/SubscriptionHeader";
import { SubscriptionFilters } from "./components/SubscriptionFilters";
import { SubscriptionKpiGrid } from "./components/SubscriptionKpiGrid";
import { TrialCard } from "./components/TrialCard";
import { ChurnCard } from "./components/ChurnCard";
import { MrrEvolutionChart } from "./components/MrrEvolutionChart";
import { MrrMovementChart } from "./components/MrrMovementChart";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionsPage() {
  const {
    metrics,
    products,
    mrrHistory,
    mrrHistoryLoading,
    isLoading,
    filters,
    setFilters,
    reload,
  } = useSubscriptions();

  return (
    <div className="flex flex-col gap-6 p-6">
      <SubscriptionHeader onRefresh={reload} />
      <SubscriptionFilters
        filters={filters}
        onFiltersChange={setFilters}
        products={products}
      />
      {isLoading || !metrics ? (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <>
          <SubscriptionKpiGrid metrics={metrics} />
          <div className="grid gap-6 lg:grid-cols-2">
            {mrrHistoryLoading ? (
              <>
                <Skeleton className="h-[380px] w-full" />
                <Skeleton className="h-[380px] w-full" />
              </>
            ) : (
              <>
                <MrrEvolutionChart data={mrrHistory} />
                <MrrMovementChart data={mrrHistory} />
              </>
            )}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <TrialCard trials={metrics.trials} />
            <ChurnCard
              churnRate={metrics.churn_rate}
              renewalRate={metrics.renewal_rate}
              avgTenure={metrics.avg_tenure_months}
              avgCancelMonths={metrics.avg_cancel_months}
              totalCanceled={metrics.total_canceled_period}
            />
          </div>
        </>
      )}
    </div>
  );
}


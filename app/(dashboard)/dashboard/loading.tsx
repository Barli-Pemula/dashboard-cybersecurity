export default function DashboardLoading() {
  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <div className="shimmer h-6 w-44 mb-2" />
        <div className="shimmer h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4 lg:p-5">
            <div className="shimmer h-3 w-20 mb-3" />
            <div className="shimmer h-6 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 card p-5">
          <div className="shimmer h-4 w-28 mb-4" />
          <div className="shimmer h-[180px] w-full" />
        </div>
        <div className="card p-5">
          <div className="shimmer h-4 w-28 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="shimmer h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsLoading() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="shimmer h-6 w-36 mb-2" />
          <div className="shimmer h-4 w-64" />
        </div>
        <div className="shimmer h-10 w-28" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-5">
            <div className="flex justify-between mb-3">
              <div className="shimmer h-5 w-14" />
              <div className="shimmer h-5 w-14" />
            </div>
            <div className="shimmer h-4 w-full mb-2" />
            <div className="shimmer h-3 w-3/4 mb-3" />
            <div className="divider mb-2.5" />
            <div className="flex justify-between">
              <div className="shimmer h-3 w-16" />
              <div className="shimmer h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

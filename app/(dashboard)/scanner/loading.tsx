export default function ScannerLoading() {
  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <div className="shimmer h-6 w-56 mb-2" />
        <div className="shimmer h-4 w-72" />
      </div>
      <div className="card p-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="shimmer h-10 flex-1" />
          <div className="shimmer h-10 w-full md:w-40" />
          <div className="shimmer h-10 w-full md:w-28" />
        </div>
      </div>
    </div>
  );
}

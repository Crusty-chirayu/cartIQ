export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-cartiq-lg overflow-hidden shadow-card">
      <div className="skeleton h-56 w-full" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-20 rounded mt-3" />
      </div>
    </div>
  );
}
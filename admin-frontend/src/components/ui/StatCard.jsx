export default function StatCard({ label, value, sub, icon, colorClass = 'bg-indigo-50 text-indigo-600' }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={'w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ' + colorClass}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-0.5 tabular-nums">{value}</div>
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}
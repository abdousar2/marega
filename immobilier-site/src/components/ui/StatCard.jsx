export default function StatCard({
  title,
  value,
  color = "blue",
  icon = "📊",
}) {
  const colors = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    orange: "bg-orange-500",
    red: "bg-red-600",
    purple: "bg-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      <div className={`h-2 ${colors[color]}`} />

      <div className="p-6 flex items-center justify-between">

        <div>

          <p className="text-slate-500 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {value}
          </h2>

        </div>

        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
          {icon}
        </div>

      </div>

    </div>
  );
}
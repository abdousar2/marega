const stats = [
  {
    number: "10+",
    label: "Immeubles réalisés",
  },
  {
    number: "48",
    label: "Collaborateurs",
  },
  {
    number: "100+",
    label: "Locataires",
  },
  {
    number: "15+",
    label: "Ans d'expérience",
  },
];

export default function Stats() {
  return (
    <section className="py-24 bg-white">

      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-4 gap-8">

          {stats.map((item, index) => (
            <div
              key={index}
              className="border rounded-xl p-8 text-center shadow-sm hover:shadow-lg transition"
            >
              <h2 className="text-5xl font-bold text-yellow-600 mb-4">
                {item.number}
              </h2>

              <p className="text-slate-600">
                {item.label}
              </p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}
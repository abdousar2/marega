const projects = [
  {
    id: 1,
    title: "Résidence MAREGA Prestige",
    location: "Almadies",
    progress: 75,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
  },
  {
    id: 2,
    title: "Résidence MAREGA Horizon",
    location: "Yoff",
    progress: 50,
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118",
  },
];

export default function ProjetsEnCours() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            Projets en cours
          </h2>

          <p className="text-slate-600 text-lg">
            Suivez l'avancement de nos réalisations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">

          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-50 rounded-2xl overflow-hidden shadow-lg"
            >
              <img
                src={project.image}
                alt={project.title}
                className="h-72 w-full object-cover"
              />

              <div className="p-6">

                <h3 className="text-2xl font-bold mb-2">
                  {project.title}
                </h3>

                <p className="text-slate-500 mb-6">
                  📍 {project.location}
                </p>

                <div className="flex justify-between mb-2">
                  <span>Avancement</span>
                  <span>{project.progress}%</span>
                </div>

                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-600"
                    style={{
                      width: `${project.progress}%`,
                    }}
                  ></div>
                </div>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
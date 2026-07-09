import { useContext } from "react";
import { ProjectsContext } from "../context/ProjectsContext";

export default function Projects() {
  const { projects } =
    useContext(ProjectsContext);

    console.log("Nombre de projets :", projects.length);
    console.table(projects);

  return (
    <section className="py-24 bg-slate-50">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <h2 className="text-5xl font-bold mb-4">
            Nos Réalisations
          </h2>

          <p className="text-slate-600">
            Découvrez nos projets immobiliers.
          </p>

        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg"
            >
              <img
                src={project.image}
                alt={project.title}
                className="h-72 w-full object-cover"
              />

              <div className="p-6">

                <h3 className="text-2xl font-bold">
                  {project.title}
                </h3>

                <p className="text-slate-500 mt-2">
                  📍 {project.location}
                </p>

              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}
import { useContext, useState } from "react";
import { ProjectsContext } from "../context/ProjectsContext";

export default function AddProject() {
  const { projects, setProjects } =
    useContext(ProjectsContext);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  const addProject = (e) => {
    e.preventDefault();

    const newProject = {
      id: Date.now(),
      title,
      location,
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
    };

    setProjects([...projects, newProject]);

    console.log([...projects, newProject]);

    setTitle("");
    setLocation("");
  };

  return (
    <form
      onSubmit={addProject}
      className="bg-white p-6 rounded-xl shadow mb-8"
    >
      <h2 className="text-2xl font-bold mb-6">
        Ajouter une réalisation
      </h2>

      <input
        type="text"
        placeholder="Nom du projet"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-3 w-full mb-4 rounded"
      />

      <input
        type="text"
        placeholder="Localisation"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border p-3 w-full mb-4 rounded"
      />

      <button
        type="submit"
        className="bg-yellow-600 text-white px-6 py-3 rounded"
      >
        Ajouter
      </button>
    </form>
  );
}
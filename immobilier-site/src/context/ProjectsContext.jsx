import { createContext, useEffect, useState } from "react";

export const ProjectsContext = createContext();

const defaultProjects = [
  {
    id: 1,
    title: "Résidence Prestige",
    location: "Almadies",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
  },
  {
    id: 2,
    title: "Résidence Horizon",
    location: "Yoff",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
];

export default function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("marega-projects");

    return saved
      ? JSON.parse(saved)
      : defaultProjects;
  });

  useEffect(() => {
    localStorage.setItem(
      "marega-projects",
      JSON.stringify(projects)
    );
  }, [projects]);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        setProjects,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}
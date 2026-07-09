import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import Stats from "../../components/Stats";
import Projects from "../../components/Projects";
import ProjetsEnCours from "../../components/ProjetsEnCours";
import Footer from "../../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Projects />
      <ProjetsEnCours />
      <Footer />
    </>
  );
}
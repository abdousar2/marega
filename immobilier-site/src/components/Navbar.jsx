export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        <h1 className="text-3xl font-black tracking-wide text-slate-900">
          MAREGA
        </h1>

        <nav className="hidden md:flex gap-8">
          <a href="#">Accueil</a>
          <a href="#">Entreprise</a>
          <a href="#">Réalisations</a>
          <a href="#">Projets</a>
          <a href="#">Contact</a>
        </nav>

        <button className="bg-yellow-600 text-white px-5 py-2 rounded-lg">
          Nous contacter
        </button>

      </div>
    </header>
  );
}
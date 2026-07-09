export default function Hero() {
  return (
    <section
      className="h-screen bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1460317442991-0ec209397118')",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 h-full flex items-center justify-start max-w-7xl mx-auto px-8">

        <div className="text-white max-w-3xl">

          <p className="uppercase tracking-widest text-yellow-400 mb-4">
            Promoteur Immobilier à Dakar
          </p>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            L'excellence immobilière à votre service
          </h1>

          <p className="text-xl mb-8">
            Construction, promotion immobilière et gestion locative.
          </p>

          <div className="flex gap-4">

            <button className="bg-yellow-600 px-8 py-4 rounded-lg">
              Nos Réalisations
            </button>

            <button className="border border-white px-8 py-4 rounded-lg">
              Contact
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}
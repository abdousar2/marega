export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">

        <div>
          <h3 className="text-2xl font-bold mb-4">
            MAREGA
          </h3>

          <p className="text-slate-300">
            Promoteur immobilier, constructeur et gestionnaire
            de biens immobiliers à Dakar.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4">
            Entreprise
          </h4>

          <ul className="space-y-2">
            <li>À propos</li>
            <li>Réalisations</li>
            <li>Projets</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">
            Contact
          </h4>

          <ul className="space-y-2">
            <li>📞 +221 XX XXX XX XX</li>
            <li>✉️ contact@marega.sn</li>
            <li>📍 Dakar, Sénégal</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">
            Horaires
          </h4>

          <ul className="space-y-2">
            <li>Lundi - Vendredi</li>
            <li>08h00 - 18h00</li>
          </ul>
        </div>

      </div>

    </footer>
  );
}
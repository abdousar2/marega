import { Link } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bouton mobile */}

      <button
        onClick={() => setOpen(!open)}
        className="
          fixed
          top-4
          left-4
          z-50
          bg-slate-900
          text-white
          p-3
          rounded-xl
        "
      >
        ☰
      </button>

      {/* Overlay */}

      {open && (
        <div
          className="
            fixed
            inset-0
            bg-black/50
            z-40
          "
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}

      <aside
        className={`
          fixed
          md:static
          top-0
          left-0
          z-50
          w-72
          bg-slate-900
          text-white
          min-h-screen
          transition-transform
          duration-300
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <div className="p-6 border-b border-slate-700">

          <h1 className="text-3xl font-bold">
            MAREGA
          </h1>

          <p className="text-slate-400 text-sm mt-2">
            ERP Immobilier
          </p>

        </div>

        <nav className="p-4">

          <ul className="space-y-2">

            <li>
              <Link
                to="/admin"
                className="
                  block
                  p-3
                  rounded-xl
                  hover:bg-slate-800
                "
              >
                📊 Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/admin/buildings"
                className="
                  block
                  p-3
                  rounded-xl
                  hover:bg-slate-800
                "
              >
                🏢 Immeubles
              </Link>
            </li>

            <li>
              <Link
                to="/admin/apartments"
                className="
                  block
                  p-3
                  rounded-xl
                  hover:bg-slate-800
                "
              >
                🏠 Appartements
              </Link>
            </li>

            <li>
              <Link
                to="/admin/tenants"
                className="
                  block
                  p-3
                  rounded-xl
                  hover:bg-slate-800
                "
              >
                👥 Locataires
              </Link>
            </li>

            <li>
              <Link
                to="/admin/payments"
                className="
                  block
                  p-3
                  rounded-xl
                  hover:bg-slate-800
                "
              >
                💰 Paiements
              </Link>
            </li>

            <li>
              <Link
                to="/admin/contracts"
                className="
                  block
                  p-3
                  rounded-xl
                  hover:bg-slate-800
                "
              >
                📄 Contrats
              </Link>
            </li>

            <li>
              <Link
                to="/admin/messages"
                className="
                  block
                  p-3
                  rounded-xl
                  hover:bg-slate-800
                "
              >
                ✉️ Messages
              </Link>
            </li>

          </ul>

        </nav>

      </aside>
    </>
  );
}
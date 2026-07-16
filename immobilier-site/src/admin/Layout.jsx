import Sidebar from "./Sidebar";

export default function Layout({ children }) {

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar />

            <div className="flex flex-col flex-1">

                {/* Header */}

                <header className="h-20 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-8">

                    <div>

                        <h1 className="text-2xl font-bold text-slate-800">
                            MAREGA
                        </h1>

                        <p className="text-sm text-slate-500">
                            Plateforme de gestion immobilière
                        </p>

                    </div>

                    <div className="flex items-center gap-4">

                        <div className="text-right">

                            <p className="font-semibold text-slate-700">
                                Administrateur
                            </p>

                            <p className="text-sm text-slate-500">
                                Connecté
                            </p>

                        </div>

                        <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-lg">

                            A

                        </div>

                    </div>

                </header>

                {/* Contenu */}

                <main className="flex-1 p-8 overflow-auto">

                    <div className="max-w-7xl mx-auto">

                        {children}

                    </div>

                </main>

            </div>

        </div>

    );

}
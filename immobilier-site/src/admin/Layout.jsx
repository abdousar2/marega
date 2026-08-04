import Sidebar from "./Sidebar";

export default function Layout({ children }) {

    return (

        <div className="h-screen bg-slate-100 flex">

            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}

                <header className="h-20 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-10">

                    <div>

                        <h1 className="text-2xl font-bold text-slate-800">

                            MAREGA ERP

                        </h1>

                        <p className="text-sm text-slate-500">

                            Gestion Immobilière Professionnelle

                        </p>

                    </div>

                    <div className="flex items-center gap-6">                        

                        <button className="text-2xl">

                            🔔

                        </button>

                        <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">

                            A

                        </div>

                    </div>

                </header>

                {/* CONTENU */}

                <main className="flex-1 overflow-y-auto">

                    <div className="max-w-7xl mx-auto py-10 px-10">

                        {children}

                    </div>

                </main>

            </div>

        </div>

    );

}
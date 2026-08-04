import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (

        <div className="h-screen bg-slate-100 flex">

            {/* Sidebar Desktop */}
            <div className="hidden lg:flex">
                <Sidebar />
            </div>

            {/* Sidebar Mobile */}
            {sidebarOpen && (

                <div className="fixed inset-0 z-50 flex">

                    <div className="w-72">

                        <Sidebar
                            closeSidebar={() => setSidebarOpen(false)}
                        />

                    </div>

                    <div
                        className="flex-1 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />

                </div>

            )}

            <div className="flex-1 flex flex-col overflow-hidden">

                <header className="h-16 lg:h-20 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 lg:px-10">

                    <div className="flex items-center gap-4">

                        {/* Bouton hamburger */}
                        <button
                            className="lg:hidden text-3xl"
                            onClick={() => setSidebarOpen(true)}
                        >
                            ☰
                        </button>

                        <div>

                            <h1 className="text-lg lg:text-2xl font-bold text-slate-800">
                                MAREGA ERP
                            </h1>

                            <p className="hidden lg:block text-sm text-slate-500">
                                Gestion Immobilière Professionnelle
                            </p>

                        </div>

                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">

                        <button className="text-xl lg:text-2xl">
                            🔔
                        </button>

                        <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            A
                        </div>

                    </div>

                </header>

                <main className="flex-1 overflow-y-auto">

                    <div className="max-w-7xl mx-auto py-5 lg:py-10 px-4 lg:px-10">

                        {children}

                    </div>

                </main>

            </div>

        </div>

    );

}
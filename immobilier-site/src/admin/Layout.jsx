import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen w-screen">

      <Sidebar />

      <main
        className="
          flex-1
          bg-slate-100
          min-h-screen
          p-4
          md:p-8
        "
      >
        {children}
      </main>

    </div>
  );
}
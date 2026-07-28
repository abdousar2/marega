export default function Empty({

    title = "Aucune donnée",

    subtitle = "Aucun élément disponible."

}) {

    return (

        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center">

            <div className="text-6xl mb-6">

                📂

            </div>

            <h2 className="text-2xl font-bold">

                {title}

            </h2>

            <p className="text-slate-500 mt-3">

                {subtitle}

            </p>

        </div>

    );

}
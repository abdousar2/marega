export default function PageHeader({

    title,

    subtitle,

    buttonLabel,

    onButtonClick

}) {

    return (

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">

            <div>

                <h1 className="text-4xl font-bold text-slate-800">

                    {title}

                </h1>

                <p className="text-slate-500 mt-2">

                    {subtitle}

                </p>

            </div>

            {

                buttonLabel && (

                    <button

                        onClick={onButtonClick}

                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow"

                    >

                        {buttonLabel}

                    </button>

                )

            }

        </div>

    );

}
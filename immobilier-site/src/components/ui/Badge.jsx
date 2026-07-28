export default function Badge({

    children,

    color = "blue"

}) {

    const colors = {

        blue: "bg-blue-100 text-blue-700",

        green: "bg-green-100 text-green-700",

        orange: "bg-orange-100 text-orange-700",

        red: "bg-red-100 text-red-700",

        gray: "bg-slate-100 text-slate-700"

    };

    return (

        <span

            className={`

                inline-flex

                items-center

                px-3

                py-1

                rounded-full

                text-sm

                font-semibold

                ${colors[color]}

            `}

        >

            {children}

        </span>

    );

}
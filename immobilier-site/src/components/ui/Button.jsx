export default function Button({

    children,

    onClick,

    type = "button",

    color = "blue",

    className = ""

}) {

    const colors = {

        blue: "bg-blue-600 hover:bg-blue-700",

        green: "bg-green-600 hover:bg-green-700",

        red: "bg-red-600 hover:bg-red-700",

        orange: "bg-orange-500 hover:bg-orange-600",

        gray: "bg-slate-600 hover:bg-slate-700"

    };

    return (

        <button

            type={type}

            onClick={onClick}

            className={`

                ${colors[color]}

                text-white

                px-5

                py-3

                rounded-xl

                font-semibold

                transition

                shadow-sm

                hover:shadow-lg

                ${className}

            `}

        >

            {children}

        </button>

    );

}
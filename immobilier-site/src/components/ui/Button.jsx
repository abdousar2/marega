import "./Button.css";

export default function Button({

    children,

    onClick,

    type = "button",

    color = "blue",

    disabled = false,

    className = ""

}) {

    return (

        <button

            type={type}

            onClick={onClick}

            disabled={disabled}

            className={`
                ui-button
                ui-button-${color}
                ${className}
            `}

        >

            {children}

        </button>

    );

}
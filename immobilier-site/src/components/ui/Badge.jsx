import "./Badge.css";

export default function Badge({

    children,

    color = "blue"

}) {

    return (

        <span
            className={`ui-badge ui-badge-${color}`}
        >

            {children}

        </span>

    );

}
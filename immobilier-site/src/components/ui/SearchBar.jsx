import "./SearchBar.css";

export default function SearchBar({

    value,

    onChange,

    placeholder = "Rechercher..."

}) {

    return (

        <div className="ui-search-bar">

            <span
                className="ui-search-icon"
                aria-hidden="true"
            >

                🔎

            </span>


            <input

                type="text"

                value={value}

                onChange={onChange}

                placeholder={placeholder}

                aria-label={placeholder}

            />

        </div>

    );

}
export default function SearchBar({

    value,

    onChange,

    placeholder = "Rechercher..."

}) {

    return (

        <input

            type="text"

            value={value}

            onChange={onChange}

            placeholder={placeholder}

            className="
                w-full
                md:w-80
                border
                border-slate-300
                rounded-xl
                px-4
                py-3
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
            "

        />

    );

}
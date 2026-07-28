import { useState } from "react";

export default function SearchBar({

    placeholder = "Rechercher...",

    onSearch

}) {

    const [value, setValue] = useState("");

    function handleChange(e) {

        setValue(e.target.value);

        if (onSearch) {

            onSearch(e.target.value);

        }

    }

    return (

        <input

            type="text"

            value={value}

            onChange={handleChange}

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
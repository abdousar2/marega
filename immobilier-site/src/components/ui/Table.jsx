import "./Table.css";

export default function Table({

    headers = [],

    children

}) {

    return (

        <div className="ui-table-container">

            <div className="ui-table-scroll">

                <table className="ui-table">

                    <thead>

                        <tr>

                            {headers.map((header) => (

                                <th key={header}>

                                    {header}

                                </th>

                            ))}

                        </tr>

                    </thead>


                    <tbody>

                        {children}

                    </tbody>

                </table>

            </div>

        </div>

    );

}
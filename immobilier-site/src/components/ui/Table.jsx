export default function Table({

    headers = [],

    children

}) {

    return (

        <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">

            <table className="w-full">

                <thead className="bg-slate-50 border-b">

                    <tr>

                        {

                            headers.map(header => (

                                <th

                                    key={header}

                                    className="
                                        px-8
                                        py-5
                                        text-left
                                        text-sm
                                        uppercase
                                        tracking-wide
                                        font-bold
                                        text-slate-500
                                    "

                                >

                                    {header}

                                </th>

                            ))

                        }

                    </tr>

                </thead>

                <tbody>

                    {children}

                </tbody>

            </table>

        </div>

    );

}
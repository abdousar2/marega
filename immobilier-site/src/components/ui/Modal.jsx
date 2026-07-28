export default function Modal({

    open,

    title,

    children,

    onClose

}) {

    if (!open) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">

                <div className="flex justify-between items-center border-b p-6">

                    <h2 className="text-2xl font-bold">

                        {title}

                    </h2>

                    <button

                        onClick={onClose}

                        className="text-2xl hover:text-red-600"

                    >

                        ×

                    </button>

                </div>

                <div className="p-6">

                    {children}

                </div>

            </div>

        </div>

    );

}
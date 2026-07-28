export default function ConfirmDialog({

    open,

    title,

    message,

    onConfirm,

    onCancel

}) {

    if (!open) return null;

    return (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

                <h2 className="text-2xl font-bold mb-4">

                    {title}

                </h2>

                <p className="text-slate-600 mb-8">

                    {message}

                </p>

                <div className="flex justify-end gap-4">

                    <button

                        onClick={onCancel}

                        className="px-5 py-3 rounded-xl bg-slate-200"

                    >

                        Annuler

                    </button>

                    <button

                        onClick={onConfirm}

                        className="px-5 py-3 rounded-xl bg-red-600 text-white"

                    >

                        Supprimer

                    </button>

                </div>

            </div>

        </div>

    );

}
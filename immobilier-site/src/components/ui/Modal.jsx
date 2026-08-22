import "./Modal.css";

export default function Modal({

    open,

    title,

    children,

    onClose

}) {

    if (!open) {
        return null;
    }


    return (

        <div
            className="ui-modal-overlay"
            onMouseDown={(event) => {

                if (
                    event.target === event.currentTarget &&
                    onClose
                ) {

                    onClose();

                }

            }}
        >

            <div
                className="ui-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ui-modal-title"
            >

                <div className="ui-modal-header">

                    <h2
                        id="ui-modal-title"
                        className="ui-modal-title"
                    >

                        {title}

                    </h2>


                    <button

                        type="button"

                        onClick={onClose}

                        className="ui-modal-close"

                        aria-label="Fermer"

                    >

                        ×

                    </button>

                </div>


                <div className="ui-modal-body">

                    {children}

                </div>

            </div>

        </div>

    );

}
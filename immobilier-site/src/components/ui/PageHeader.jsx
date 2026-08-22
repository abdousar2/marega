import "./PageHeader.css";

export default function PageHeader({

    title,

    subtitle,

    buttonLabel,

    onButtonClick

}) {

    return (

        <div className="ui-page-header">

            <div className="ui-page-header-content">

                <h1 className="ui-page-header-title">
                    {title}
                </h1>

                {subtitle && (

                    <p className="ui-page-header-subtitle">
                        {subtitle}
                    </p>

                )}

            </div>


            {buttonLabel && (

                <button
                    type="button"
                    onClick={onButtonClick}
                    className="ui-page-header-button"
                >

                    {buttonLabel}

                </button>

            )}

        </div>

    );

}
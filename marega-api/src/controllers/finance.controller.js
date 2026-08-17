const Finance = require("../models/finance.model");


class FinanceController {

    // =========================================================
    // RAPPORT FINANCIER
    // =========================================================

    static async getReport(req, res) {

        try {

            const {
                period = "daily",
                date,
                start,
                end
            } = req.query;


            // -------------------------------------------------
            // DATE DE RÉFÉRENCE
            // -------------------------------------------------

            const referenceDate =
                date
                ? new Date(`${date}T00:00:00`)
                : new Date();


            if (
                Number.isNaN(
                    referenceDate.getTime()
                )
            ) {

                return res.status(400).json({

                    error:
                        "Date de référence invalide."

                });

            }


            let startDate;
            let endDate;


            // -------------------------------------------------
            // JOUR
            // -------------------------------------------------

            if (period === "daily") {

                startDate =
                    formatDate(
                        referenceDate
                    );

                endDate =
                    startDate;

            }


            // -------------------------------------------------
            // SEMAINE
            // LUNDI → DIMANCHE
            // -------------------------------------------------

            else if (period === "weekly") {

                const day =
                    referenceDate.getDay();


                const difference =
                    day === 0
                        ? -6
                        : 1 - day;


                const monday =
                    new Date(
                        referenceDate
                    );


                monday.setDate(
                    referenceDate.getDate()
                    +
                    difference
                );


                const sunday =
                    new Date(
                        monday
                    );


                sunday.setDate(
                    monday.getDate()
                    + 6
                );


                startDate =
                    formatDate(
                        monday
                    );

                endDate =
                    formatDate(
                        sunday
                    );

            }


            // -------------------------------------------------
            // MOIS
            // -------------------------------------------------

            else if (period === "monthly") {

                const firstDay =
                    new Date(
                        referenceDate.getFullYear(),
                        referenceDate.getMonth(),
                        1
                    );


                const lastDay =
                    new Date(
                        referenceDate.getFullYear(),
                        referenceDate.getMonth() + 1,
                        0
                    );


                startDate =
                    formatDate(
                        firstDay
                    );

                endDate =
                    formatDate(
                        lastDay
                    );

            }


            // -------------------------------------------------
            // ANNÉE
            // -------------------------------------------------

            else if (period === "yearly") {

                const year =
                    referenceDate.getFullYear();


                startDate =
                    `${year}-01-01`;

                endDate =
                    `${year}-12-31`;

            }


            // -------------------------------------------------
            // PÉRIODE PERSONNALISÉE
            // -------------------------------------------------

            else if (period === "custom") {

                if (
                    !start
                    ||
                    !end
                ) {

                    return res.status(400).json({

                        error:
                            "Les dates de début et de fin sont obligatoires."

                    });

                }


                const customStart =
                    new Date(
                        `${start}T00:00:00`
                    );


                const customEnd =
                    new Date(
                        `${end}T00:00:00`
                    );


                if (
                    Number.isNaN(
                        customStart.getTime()
                    )
                    ||
                    Number.isNaN(
                        customEnd.getTime()
                    )
                ) {

                    return res.status(400).json({

                        error:
                            "Période personnalisée invalide."

                    });

                }


                if (
                    customStart >
                    customEnd
                ) {

                    return res.status(400).json({

                        error:
                            "La date de début doit être antérieure ou égale à la date de fin."

                    });

                }


                startDate = start;

                endDate = end;

            }


            // -------------------------------------------------
            // PÉRIODE INVALIDE
            // -------------------------------------------------

            else {

                return res.status(400).json({

                    error:
                        "Période invalide. Utilisez daily, weekly, monthly, yearly ou custom."

                });

            }


            // -------------------------------------------------
            // RAPPORT
            // -------------------------------------------------

            const report =
                await Finance.getReport(
                    startDate,
                    endDate
                );


            // -------------------------------------------------
            // RÉPONSE
            // -------------------------------------------------

            res.json({

                ...report,

                period: {

                    type:
                        period,

                    start:
                        startDate,

                    end:
                        endDate

                }

            });

        }

        catch (err) {

            console.error(
                "Erreur rapport financier :",
                err
            );


            res.status(500).json({

                error:
                    "Erreur lors du chargement du rapport financier."

            });

        }

    }

}


// =========================================================
// OUTIL DATE
// =========================================================

function formatDate(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


module.exports = FinanceController;
const ContactRequestModel = require(
    "../models/contactRequest.model"
);


const createContactRequest = async (req, res) => {

    try {

        const {
            name,
            phone,
            email,
            company,
            buildings,
            tenants,
            message
        } = req.body;


        if (
            !name ||
            !phone ||
            !email ||
            !company ||
            !message
        ) {

            return res.status(400).json({
                message:
                    "Les champs obligatoires sont requis."
            });

        }


        const contactRequest =
            await ContactRequestModel.create({
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim().toLowerCase(),
                company: company.trim(),
                buildings,
                tenants,
                message: message.trim()
            });


        return res.status(201).json({

            message:
                "Votre demande a bien été enregistrée.",

            contactRequest

        });

    } catch (error) {

        console.error(
            "Erreur création demande contact :",
            error
        );


        return res.status(500).json({

            message:
                "Impossible d'enregistrer votre demande."

        });

    }

};


module.exports = {
    createContactRequest
};
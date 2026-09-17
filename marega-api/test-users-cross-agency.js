require("dotenv").config();

const User = require("./src/models/user.model");

(async () => {

    console.log("=== USER 12 VU DEPUIS AGENCE 1 ===");

    const cross1 =
        await User.findById(12, 1);

    console.log(cross1 || "AUCUN UTILISATEUR");


    console.log("=== USER 1 VU DEPUIS AGENCE 5 ===");

    const cross5 =
        await User.findById(1, 5);

    console.log(cross5 || "AUCUN UTILISATEUR");


    process.exit(0);

})().catch(error => {

    console.error(error);
    process.exit(1);

});

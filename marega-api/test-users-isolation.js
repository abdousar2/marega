require("dotenv").config();

const User = require("./src/models/user.model");

(async () => {

    const agency1 = await User.getAll(1);

    console.log("=== AGENCE 1 ===");
    console.table(
        agency1.map(u => ({
            id: u.id,
            email: u.email,
            role: u.role,
            active: u.active
        }))
    );


    const agency5 = await User.getAll(5);

    console.log("=== AGENCE 5 ===");
    console.table(
        agency5.map(u => ({
            id: u.id,
            email: u.email,
            role: u.role,
            active: u.active
        }))
    );


    process.exit(0);

})().catch(error => {

    console.error(error);
    process.exit(1);

});

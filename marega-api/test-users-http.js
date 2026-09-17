require("dotenv").config();

const jwt = require("jsonwebtoken");

const API = "http://localhost:5000/api/users";

function createToken(userId, email, agencyId, role, agencyName) {

    return jwt.sign(
        {
            id: userId,
            email,
            role,
            agency_id: agencyId,
            agency_name: agencyName
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "5m"
        }
    );
}


async function request(label, token, url) {

    const response =
        await fetch(url, {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        });

    const data =
        await response.json();

    console.log(`\n=== ${label} ===`);
    console.log("HTTP :", response.status);
    console.dir(data, {
        depth: null
    });
}


(async () => {

    const agency1Token =
        createToken(
            1,
            "admin@marega.sn",
            1,
            "ADMIN",
            "IBM MAREGA"
        );


    const agency5Token =
        createToken(
            12,
            "test@example.com",
            5,
            "ADMIN",
            "Agence Test 4"
        );


    // -------------------------------------------------
    // LISTE AGENCE 1
    // -------------------------------------------------

    await request(
        "AGENCE 1 ? GET /api/users",
        agency1Token,
        API
    );


    // -------------------------------------------------
    // LISTE AGENCE 5
    // -------------------------------------------------

    await request(
        "AGENCE 5 ? GET /api/users",
        agency5Token,
        API
    );


    // -------------------------------------------------
    // USER 12 VU PAR AGENCE 1
    // -------------------------------------------------

    await request(
        "AGENCE 1 ? GET USER 12",
        agency1Token,
        `${API}/12`
    );


    // -------------------------------------------------
    // USER 1 VU PAR AGENCE 5
    // -------------------------------------------------

    await request(
        "AGENCE 5 ? GET USER 1",
        agency5Token,
        `${API}/1`
    );

})();

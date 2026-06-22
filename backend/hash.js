const bcrypt = require("bcryptjs");

const password = "Novamix123"

async function hashPassword(password) {
    const passwordHashed = await bcrypt.hash(password, 10);
    console.log(passwordHashed);

    return passwordHashed
}

hashPassword(password);
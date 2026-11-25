const db = require("../config/database");

const getAllUsers = (callback) => {
    const sql = "SELECT user_id, name, email, role FROM users";

    db.query(sql, callback);
};

const createUser = (name, email, password, callback) => {
    const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [name, email, password], callback);
};

const findUserByEmail = (email, callback) => {
    const sql = `
        SELECT * FROM users
        WHERE email = ?
    `;

    db.query(sql, [email], callback);
};

module.exports = {
    getAllUsers,
    createUser,
    findUserByEmail
};
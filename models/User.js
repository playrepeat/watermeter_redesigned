//const pool = require('../db'); // Database connection
const bcrypt = require('bcryptjs');
const db = require('../db');

class User {
    constructor(id, email, firstName, lastName, apartment) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.apartment = apartment;
    }

    // Static method to fetch user by email
    static async findByEmail(email) {
        const result = await db.query(
            `SELECT id, email, first_name, last_name, apartment 
             FROM watermeterusers 
             WHERE email = $1`,
            [email]
        );
        const user = result.rows[0];
        return user ? new User(user.id, user.email, user.first_name, user.last_name, user.apartment) : null;
    }

    // Static method to fetch password details by user ID
    static async findPasswordDetailsByUserId(userId) {
        const result = await db.query(
            `SELECT hashed_password, failed_attempts, is_locked, password_last_changed, password_history 
             FROM watermeterpwd 
             WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0];
    }

    // Static method to increment failed attempts
    static async incrementFailedAttempts(userId) {
        await db.query(
            `UPDATE watermeterpwd 
             SET failed_attempts = failed_attempts + 1 
             WHERE user_id = $1`,
            [userId]
        );
    }

    // Static method to fetch user by ID
    static async findById(id) {
        const result = await db.query(
            `SELECT id, email, first_name, last_name, apartment 
             FROM watermeterusers 
             WHERE id = $1`,
            [id]
        );
        const user = result.rows[0];
        return user ? new User(user.id, user.email, user.first_name, user.last_name, user.apartment) : null;
    }

    // Static method to reset failed attempts
    static async resetFailedAttempts(userId) {
        await db.query(
            `UPDATE watermeterpwd 
             SET failed_attempts = 0 
             WHERE user_id = $1`,
            [userId]
        );
    }

    // Static method to lock the user account
    static async lockUser(userId) {
        await db.query(
            `UPDATE watermeterpwd 
             SET is_locked = true 
             WHERE user_id = $1`,
            [userId]
        );
    }

    // Static method to update password
    static async updatePassword(userId, newHashedPassword) {
        await db.query(
            `UPDATE watermeterpwd 
             SET hashed_password = $1, 
                 password_last_changed = NOW(), 
                 password_history = jsonb_insert(password_history, '{0}', to_jsonb(hashed_password::text)) 
             WHERE user_id = $2`,
            [newHashedPassword, userId]
        );
    }
}

module.exports = User;
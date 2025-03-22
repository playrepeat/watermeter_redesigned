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

    // Static method to create a new user
    static async create({ email, password, firstName, lastName, apartment }) {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into watermeterusers table
        const result = await db.query(
            `INSERT INTO watermeterusers (email, first_name, last_name, apartment) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [email, firstName, lastName, apartment]
        );

        const userId = result.rows[0].id;

        // Insert hashed password into watermeterpwd table
        await db.query(
            `INSERT INTO watermeterpwd (user_id, hashed_password, failed_attempts, is_locked, password_last_changed) 
             VALUES ($1, $2, 0, false, NOW())`,
            [userId, hashedPassword]
        );

        // Store the first password in the password history table
        await db.query(
            `INSERT INTO watermeterpwd_history (user_id, hashed_password, changed_at) 
             VALUES ($1, $2, NOW())`,
            [userId, hashedPassword]
        );

        return userId;
    }

    // Static method to fetch user by email
    static async findByEmail(email) {
        const result = await db.query(
            `SELECT id, email, first_name, last_name, apartment, is_admin
             FROM watermeterusers 
             WHERE email = $1`,
            [email]
        );
        const user = result.rows[0];
        return user ? new User(user.id, user.email, user.first_name, user.last_name, user.apartment, user.is_admin) : null;
    }
    

    // Static method to fetch password details by user ID
    static async findPasswordDetailsByUserId(userId) {
        const result = await db.query(
            `SELECT hashed_password, failed_attempts, is_locked, password_last_changed 
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
        // Fetch the last 6 passwords from watermeterpwd_history
        const result = await db.query(
            `SELECT hashed_password FROM watermeterpwd_history 
             WHERE user_id = $1 
             ORDER BY changed_at DESC 
             LIMIT 6`,
            [userId]
        );

        const passwordHistory = result.rows.map(row => row.hashed_password);

        // Check if the new password exists in the last 6 stored passwords
        if (passwordHistory.includes(newHashedPassword)) {
            throw new Error("You cannot reuse a previous password. Please choose a new one.");
        }

        // Update password in the watermeterpwd table
        await db.query(
            `UPDATE watermeterpwd 
             SET hashed_password = $1, 
                 password_last_changed = NOW()
             WHERE user_id = $2`,
            [newHashedPassword, userId]
        );

        // Insert new password into watermeterpwd_history
        await db.query(
            `INSERT INTO watermeterpwd_history (user_id, hashed_password, changed_at) 
             VALUES ($1, $2, NOW())`,
            [userId, newHashedPassword]
        );

        // Delete old password history beyond the last 6 entries
        await db.query(
            `DELETE FROM watermeterpwd_history 
             WHERE user_id = $1 
             AND id NOT IN (
                 SELECT id FROM watermeterpwd_history 
                 WHERE user_id = $1 
                 ORDER BY changed_at DESC 
                 LIMIT 6
             )`,
            [userId]
        );
    }
}

module.exports = User;

const pool = require('../db');

class WaterRecord {
    // Fetch all water records for a specific user
    static async getByUserId(userId) {
        const query = `
            SELECT id, reading_date, water_usage, notes
            FROM watermeterrecords
            WHERE user_id = $1
            ORDER BY reading_date DESC;
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    // Add a new water record
    static async addRecord(userId, waterUsage, notes) {
        const query = `
            INSERT INTO watermeterrecords (user_id, water_usage, notes)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await pool.query(query, [userId, waterUsage, notes]);
        return result.rows[0];
    }

    // Update an existing water record
    static async updateRecord(recordId, waterUsage, notes) {
        const query = `
            UPDATE watermeterrecords
            SET water_usage = $1, notes = $2
            WHERE id = $3
            RETURNING *;
        `;
        const result = await pool.query(query, [waterUsage, notes, recordId]);
        return result.rows[0];
    }


    // Delete a water record
    static async deleteRecord(recordId) {
        const query = `
            DELETE FROM watermeterrecords
            WHERE id = $1;
        `;
        const result = await pool.query(query, [recordId]);
        return result.rowCount > 0;
    }
}

module.exports = WaterRecord;

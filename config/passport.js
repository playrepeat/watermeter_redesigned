const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            try {
                console.log('Looking for user:', email);
                // Fetch the user from watermeterusers table
                const user = await User.findByEmail(email);
                if (!user) {
                    return done(null, false, { message: 'No user found with that email.' });
                }
                console.log('User found:', user);

                // Fetch the hashed password and other fields from watermeterpwd table
                const userPassword = await User.findPasswordDetailsByUserId(user.id);
                if (!userPassword || userPassword.is_locked) {
                    console.log('Password is undefined for this user:', user);
                    return done(null, false, { message: 'Account is locked or password record not found.' });
                }

                // Compare passwords
                const isMatch = await bcrypt.compare(password, userPassword.hashed_password);
                console.log('Password match:', isMatch);
                if (isMatch) {
                    return done(null, user); // Successful login
                } else {
                    // Optionally handle failed attempts
                    await User.incrementFailedAttempts(user.id);
                    return done(null, false, { message: 'Incorrect password.' });
                }
            } catch (err) {
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};

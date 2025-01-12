import './config.mjs';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import slugify from 'slugify';

const User = mongoose.model('User');

const startLogin = function(req, user) {

    return new Promise(function(fulfill, reject) {

        req.session.regenerate(function(err) {

            if (!err) {

                req.session.user = user;
                fulfill(user);

            } else {

                reject(err);
            }
        });
    });
};

const endLogin = function(req) {

    return new Promise(function(fulfill, reject) {

        req.session.destroy(function(err) {

            if (err) {

                reject(err);

            } else {

                fulfill(null);
            }
        });
    });
};

const sendVerification = function (email) {

    let verificationCode = '';

    for (let i = 0; i < 6; i++) {

        let digit = Math.floor(Math.random() * 10);
        verificationCode += digit;
    }

    const transporter = nodemailer.createTransport({

        service: 'gmail',
        auth: {
            user: process.env.gmailUser,
            pass: process.env.gmailPass
        }
    });

    const mailOptions = {
        
        from: process.env.gmailUser,
        to: email,
        subject: "Verify your MyPlayerTracker account",
        text: "Here is your verification code:\n" + verificationCode
    };

    transporter.sendMail(mailOptions, function(error, info) {

        if (error) {

            console.log(error);

        } else {

            console.log('Email sent: ', info.response);
        }
    });

    return verificationCode;
};

const register = async(email, username, password) => {

    const userExists = await User.findOne({ username });

    if (userExists) {

        throw({message: 'Username already exists'});
    }

    const emailExists = await User.findOne({ email });

    if (emailExists) {

        throw({message: 'The email provided is already registered with another user'})
    }

    const saltHashPass = bcrypt.hashSync(password, 10);

    const userSlug = slugify(username, {lower: true});

    const newUser = new User ({

        email,
        username,
        password: saltHashPass,
        slug: userSlug
    })

    return await newUser.save();
}

const login = async(username, password) => {

    const userExists = await User.findOne({username});

    if (!userExists) {

        throw({message: 'Username not found'});
    }

    if (!(bcrypt.compareSync(password, userExists.password))) {

        throw({message: 'Password is incorrect'});
    }

    if (!userExists.verified) {

        throw({message: 'You have not verified your account'})
    }

    return userExists;
}

export {
    startLogin,
    endLogin,
    sendVerification,
    register,
    login
}
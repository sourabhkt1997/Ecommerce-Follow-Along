const express = require("express");

const { UserModel } = require("../model/userModel")
const bcrypt = require("bcrypt")
require("dotenv").config()
const jwt = require("jsonwebtoken")
const { RefreshTokenModel } = require("../model/refreshTokenModel")
const { sendMail } = require("../utils/mail");


let userSignup = async (req, res) => {

    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(422).json({ message: "name,email and password are required" })
        }

        const user = await UserModel.findOne({ email });

        if (user) {
            res.status(400).json({ message: "user already exist" })
        }
        else {
            bcrypt.hash(password, 5, async (err, hash) => {
                try {
                    if (err) {
                        console.log(err)
                        res.status(500).json({ message: "internal server error" })
                    }
                    const newUser = new UserModel({ name, email, password: hash });
                    await newUser.save();

                    const activationToken = jwt.sign(
                        { id: newUser._id },
                        process.env.REFRESH,
                        { expiresIn: "7d" }
                    );
                    console.log(newUser,"*8*8")

                    const activationUrl = `http://localhost:8050/user/activation/${activationToken}`;

                    try {
                        await sendMail(
                            {
                                email: newUser.email,
                                subject: "Activate your account",
                                message: `Hello ${newUser.name}, please click on the link to activate your account: ${activationUrl}`,

                            }
                        )
                    }
                    catch (err) {
                        console.log(err)
                        res.status(400).json({ messgae: "server error" })
                    }

                    res.status(201).json({ messgae: `please check your email:- ${newUser.email} to activate your account!` })
                }
                catch (err) {
                    console.log(err)
                    res.status(400).json({ messgae: "could not register" })
                }
            })

        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error in signin up" })
    }
}

const activation = async (req, res) => {
    try {
        const { activationToken } = req.params;

        let userId;
        try {
            userId = jwt.verify(activationToken, process.env.REFRESH);
        } catch (err) {
            return res.status(400).json({ message: "Invalid or expired activation token" });
        }
        console.log(userId)
        let id=userId.id
        console.log(id,typeof id)
        const user = await UserModel.findById(id)
        console.log(user,"***")
        if (!user) {
            res.status(400).json({ message: "some error happened" })
        }
        
        const accessToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.ACCESS,
            { expiresIn: "5m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH,
            { expiresIn: "7d" }
        );

        user.activated = true;
        await user.save()

        res.cookie(`estore_accessToken`, accessToken, {
            httpOnly: true,
            sameSite: "None",
            maxAge: 15 * 60 * 1000,
        });

        res.cookie(`estore_refreshToken`, refreshToken, {
            httpOnly: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect("http://localhost:3000");

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error in signin up" })
    }
}


const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }


        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "User needs to sign up before logging in" });
        }

        if (!user.activated) {
            return res.status(401).json({ message: "please check the email and comform email address" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Password is incorrect" });
        }


        const accessToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.ACCESS,
            { expiresIn: "5m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH,
            { expiresIn: "7d" }
        );


        const newRefresh = new RefreshTokenModel({
            userId: user._id,
            token: refreshToken,
        });
        await newRefresh.save();


        res.cookie(`estore_accessToken`, accessToken, {
            httpOnly: true,
            sameSite: "None",
            maxAge: 15 * 60 * 1000,
        });

        res.cookie(`estore_refreshToken`, refreshToken, {
            httpOnly: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        res.status(200).json({
            success: true,
            message: "Tokens set successfully",
            token: accessToken,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error in signing in" });
    }
};


const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.estore_refreshToken;
    if (!refreshToken) return res.status(403).json({ error: 'please log-in again' });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH)

    const token = await RefreshTokenModel.find({ userId: decoded.userId });


    if (!token) return res.status(403).json({ error: 'Invalid token' });
    // i need to check the multiple token ---pending
    const user = await UserModel.findById(decoded.id);

    const newAccessToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.ACCESS,
        { expiresIn: "5m" }
    );

    res.cookie(`estore_accessToken`, newAccessToken, {
        httpOnly: true,
        sameSite: "None",
        maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({

        message: "Tokens set successfully",

    });

};


const logOut = async (req, res) => {
    const refreshToken = req.cookies.estore_refreshToken;

    await RefreshTokenModel.findOneAndDelete({ token: refreshToken });


    res.clearCookie('estore_accessToken');
    res.clearCookie('estore_refreshToken');

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};




module.exports = { userSignup, userLogin, refreshToken, logOut, activation }



// reset password
//authenticate
//authorization




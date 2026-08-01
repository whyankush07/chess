import Router from 'express';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import db from '@repo/db';
import { saveUser, getUserByEmail } from "@repo/db/queries/user";
import { User } from '@repo/types/chess';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "IAMHUMANBEING";

router.post('/signup', async (req, res) => {
    try {
        const reqBody = req.body;
        const { username, email, password } = reqBody;

        if (!username || !email || !password) {
            return res.json(400).json({ msg: "In-sufficient parameteres!!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser: User = {
            username,
            email,
            password: hashedPassword,
        };

        await saveUser(db, newUser);

        res.status(201).json({ msg: "User created successfully!!" });
    } catch (err) {
        console.error("Error while signing up...", err);
        res.status(500).json({ msg: "Server Error!" });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const reqBody = req.body;
        const { email, password } = reqBody;

        if (!email || !password) {
            return res.status(400).json({ msg: "In-sufficient parameteres!!" });
        }

        const user = await getUserByEmail(db, email);
        if (!user) {
            return res.status(404).json({ msg: "User not found!!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ msg: "Invalid password!!" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            msg: "Sign in successful!!",
            user
        });
    } catch (err) {
        console.error("Error while signing in...", err);
        res.status(500).json({ msg: "Server Error!" });
    }
});

export const authRoutes = router;
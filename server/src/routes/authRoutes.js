import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { signToken } from "../auth.js";
import { importGuestData } from "../guestImport.js";
import { loginSchema, signupSchema, validate } from "../validators.js";

export const authRoutes = Router();

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

authRoutes.post("/signup", async (req, res, next) => {
  try {
    const data = validate(signupSchema, req.body);
    const email = data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email,
        password: await bcrypt.hash(data.password, 12)
      }
    });

    if (data.guestData) {
      await importGuestData(user.id, data.guestData);
    }

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/login", async (req, res, next) => {
  try {
    const data = validate(loginSchema, req.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/upgrade", async (req, res, next) => {
  try {
    const data = validate(signupSchema, req.body);
    const email = data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already exists. Log in instead." });
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email,
        password: await bcrypt.hash(data.password, 12)
      }
    });

    await importGuestData(user.id, data.guestData);
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

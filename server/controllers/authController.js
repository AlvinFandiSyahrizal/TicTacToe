import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
export async function register(req, res) {
  const { username, password, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username dan password wajib diisi" });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ message: "Username harus 3–20 karakter" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password minimal 6 karakter" });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: "Username sudah dipakai" });
    }

    if (email) {
      const emailExist = await prisma.user.findUnique({ where: { email } });
      if (emailExist) {
        return res.status(409).json({ message: "Email sudah dipakai" });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashed, email: email || null },
    });

    const token = generateToken(user);
    return res.status(201).json({
      token,
      user: { id: user.id, username: user.username, points: user.points },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username dan password wajib diisi" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const token = generateToken(user);
    return res.json({
      token,
      user: { id: user.id, username: user.username, points: user.points },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/auth/me
export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, username: true, email: true,
        points: true, wins: true, losses: true, draws: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
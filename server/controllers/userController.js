import bcrypt from "bcryptjs";
import prisma from "../config/db.js";

// GET /api/user/leaderboard
export async function leaderboard(req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { points: "desc" },
      take: 50,
      select: {
        id: true, username: true, points: true,
        wins: true, losses: true, draws: true,
      },
    });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/user/:username
export async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true, username: true, points: true,
        wins: true, losses: true, draws: true,
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

// PATCH /api/user/update — ganti email atau password
export async function updateProfile(req, res) {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const updates = {};

    if (email !== undefined) {
      if (email !== "") {
        const emailExist = await prisma.user.findUnique({ where: { email } });
        if (emailExist && emailExist.id !== user.id) {
          return res.status(409).json({ message: "Email sudah dipakai" });
        }
        updates.email = email;
      } else {
        updates.email = null;
      }
    }

    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Masukkan password lama dulu" });
      }
      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) {
        return res.status(401).json({ message: "Password lama salah" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password baru minimal 6 karakter" });
      }
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Tidak ada yang diubah" });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
      select: { id: true, username: true, email: true, points: true },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
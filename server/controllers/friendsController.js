import prisma from "../config/db.js";

// POST /api/friends/request — kirim friend request
export async function sendRequest(req, res) {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username wajib diisi" });
  }

  if (username === req.user.username) {
    return res.status(400).json({ message: "Tidak bisa add diri sendiri" });
  }

  try {
    const target = await prisma.user.findUnique({ where: { username } });
    if (!target) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Cek sudah ada request / sudah teman
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: target.id },
          { senderId: target.id, receiverId: req.user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(409).json({ message: "Sudah berteman" });
      }
      return res.status(409).json({ message: "Request sudah dikirim" });
    }

    const friendship = await prisma.friendship.create({
      data: { senderId: req.user.id, receiverId: target.id },
    });

    return res.status(201).json(friendship);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/friends/respond — terima atau tolak
export async function respondRequest(req, res) {
  const { friendshipId, action } = req.body; // action: "accept" | "reject"

  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({ message: "Action tidak valid" });
  }

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return res.status(404).json({ message: "Request tidak ditemukan" });
    }

    if (friendship.receiverId !== req.user.id) {
      return res.status(403).json({ message: "Bukan request untukmu" });
    }

    if (action === "accept") {
      const updated = await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: "accepted" },
      });
      return res.json(updated);
    } else {
      await prisma.friendship.delete({ where: { id: friendshipId } });
      return res.json({ message: "Request ditolak" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/friends/list — daftar teman
export async function getFriends(req, res) {
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: req.user.id, status: "accepted" },
          { receiverId: req.user.id, status: "accepted" },
        ],
      },
      include: {
        sender:   { select: { id: true, username: true, avatarId: true, points: true } },
        receiver: { select: { id: true, username: true, avatarId: true, points: true } },
      },
    });

    // Return teman (bukan diri sendiri)
    const friends = friendships.map((f) =>
      f.senderId === req.user.id ? f.receiver : f.sender
    );

    return res.json(friends);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/friends/pending — request yang belum direspons
export async function getPending(req, res) {
  try {
    const pending = await prisma.friendship.findMany({
      where: { receiverId: req.user.id, status: "pending" },
      include: {
        sender: { select: { id: true, username: true, avatarId: true } },
      },
    });
    return res.json(pending);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/friends/stats/:friendId
export async function getFriendStats(req, res) {
  const { friendId } = req.params;
  const myId = req.user.id;

  try {
    const games = await prisma.friendGame.findMany({
      where: {
        OR: [
          { player1Id: myId,     player2Id: friendId },
          { player1Id: friendId, player2Id: myId     },
        ],
      },
    });

    let win = 0, lose = 0, draw = 0;

    for (const g of games) {
      if (!g.winnerId) {
        draw++;
      } else if (g.winnerId === myId) {
        win++;
      } else {
        lose++;
      }
    }

    return res.json({ win, lose, draw, total: games.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
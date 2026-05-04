"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useSocket } from "@/lib/useSocket";
import Board from "./Board";
import GameStatus from "./GameStatus";
import Timer from "./Timer";
import CoinFlip from "./CoinFlip";
import RoundHistory from "./RoundHistory";
import Matchmaking from "./Matchmaking";
import OnlineGame from "./OnlineGame";
import {
  createBoard, applyMove, checkWinner, checkDraw,
  coinFlip, determineFirstPlayer,
} from "@/lib/gameEngine";
import { getBotMove, randomMove } from "@/lib/botEngine";

export default function GamePanel({ activeMode, onExit, friendMatchData: incomingFriendMatch }) {
  const { user } = useAuthStore();
  const { socket } = useSocket();

  // Ranked state
  const [rankPhase, setRankPhase] = useState("idle"); // idle | matchmaking | playing
  const [matchData, setMatchData] = useState(null);
  const [friendMatchData, setFriendMatchData] = useState(null);

  // Bot state
  const [board, setBoard]                 = useState(createBoard());
  const [firstPlayer, setFirstPlayer]     = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [winner, setWinner]               = useState(null);
  const [winningLine, setWinningLine]     = useState(null);
  const [isDraw, setIsDraw]               = useState(false);
  const [lostByTimeout, setLostByTimeout] = useState(false);
  const [surrendered, setSurrendered]     = useState(false);
  const [difficulty, setDifficulty]       = useState("easy");
  const [score, setScore]                 = useState({ win: 0, lose: 0, draw: 0 });
  const [history, setHistory]             = useState([]);
  const [timerKey, setTimerKey]           = useState(0);
  const [showFlip, setShowFlip]           = useState(false);
  const [flipResult, setFlipResult]       = useState(null);
  const [lastWinner, setLastWinner]       = useState(undefined);

  const isGameOver   = winner !== null || isDraw || lostByTimeout || surrendered;
  const isPlayerTurn = currentPlayer === "X";

  useEffect(() => {
  if (incomingFriendMatch) {
      setFriendMatchData(incomingFriendMatch);
    }
  }, [incomingFriendMatch]);

  useEffect(() => {
    if (activeMode === "bot") startNewSession();
    if (activeMode !== "ranked") setRankPhase("idle");
  }, [activeMode]);

  // ── Bot logic (sama seperti sebelumnya) ─────────────────────

  function startNewSession() {
    const result = coinFlip();
    setFlipResult(result);
    setShowFlip(true);
    setScore({ win: 0, lose: 0, draw: 0 });
    setHistory([]);
    setLastWinner(undefined);
  }

  function onFlipDone() {
    setShowFlip(false);
    setFirstPlayer(flipResult);
    initRound(flipResult);
  }

  function initRound(fp) {
    setBoard(createBoard());
    setCurrentPlayer(fp);
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
    setLostByTimeout(false);
    setSurrendered(false);
    setTimerKey((k) => k + 1);
  }

  useEffect(() => {
    if (currentPlayer === "O" && !isGameOver) {
      const t = setTimeout(() => {
        const idx = getBotMove(board, difficulty);
        if (idx !== null) handleMove(idx, "O");
      }, 400);
      return () => clearTimeout(t);
    }
  }, [currentPlayer, board, isGameOver]);

  function handleMove(index, player) {
    const newBoard = applyMove(board, index, player);
    const { winner: w, line } = checkWinner(newBoard);
    const draw = !w && checkDraw(newBoard);
    setBoard(newBoard);
    setTimerKey((k) => k + 1);
    if (w) endRound(newBoard, w, line, "normal");
    else if (draw) endRound(newBoard, null, null, "draw");
    else setCurrentPlayer(player === "X" ? "O" : "X");
  }

  function handleCellClick(index) {
    if (!isPlayerTurn || board[index] !== null || isGameOver) return;
    handleMove(index, "X");
  }

  function handleTimeout() {
    if (!isPlayerTurn || isGameOver) return;
    const idx = randomMove(board);
    if (idx !== null) handleMove(idx, "X");
  }

  function handleSurrender() {
    if (isGameOver) return;
    setSurrendered(true);
    setCurrentPlayer(null);
    setHistory((p) => [...p, { result: "lose", reason: "surrender" }]);
    setScore((p) => ({ ...p, lose: p.lose + 1 }));
    setLastWinner("O");
  }

  function endRound(_, w, line, reason) {
    setWinner(w);
    setWinningLine(line);
    if (reason === "draw") setIsDraw(true);
    setCurrentPlayer(null);
    setLastWinner(w);
    if (w === "X") {
      setHistory((p) => [...p, { result: "win", reason }]);
      setScore((p) => ({ ...p, win: p.win + 1 }));
    } else if (w === "O") {
      setHistory((p) => [...p, { result: "lose", reason }]);
      setScore((p) => ({ ...p, lose: p.lose + 1 }));
    } else {
      setHistory((p) => [...p, { result: "draw", reason }]);
      setScore((p) => ({ ...p, draw: p.draw + 1 }));
    }
  }

  function nextRound() {
    const next = lastWinner === null ? coinFlip() : determineFirstPlayer(lastWinner);
    setFirstPlayer(next);
    initRound(next);
  }

  // ── Render ───────────────────────────────────────────────────

  if (!activeMode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-6xl">🎮</div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Pilih Mode Main</h2>
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
          Pilih mode di panel kiri untuk mulai bermain.
        </p>
      </div>
    );
  }

  // ── Ranked ───────────────────────────────────────────────────
  if (activeMode === "ranked") {
    if (!user) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-5xl">🔒</p>
          <p className="font-semibold">Harus login untuk main ranked</p>
          <a href="/login" className="text-sm text-blue-500 hover:underline">Login sekarang</a>
        </div>
      );
    }

if (rankPhase === "idle") {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
      <div className="text-5xl">🏆</div>
      <div>
        <h2 className="text-xl font-bold">Ranked Match</h2>
        <p className="text-sm text-gray-400 mt-1">Menang +25 · Kalah -15 · Draw +5</p>
      </div>
      <button
        onClick={() => {
          if (!socket) {
            alert("Koneksi belum siap, tunggu sebentar");
            return;
          }
          setRankPhase("matchmaking");
        }}
        className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
      >
        Cari Lawan
      </button>
      <button onClick={onExit} className="text-sm text-gray-400 hover:text-gray-600">
        ← Kembali
      </button>
    </div>
  );
}

    if (rankPhase === "matchmaking") {
      return (
        <Matchmaking
          socket={socket}
          user={user}
          onMatched={(data) => {
            setMatchData(data);
            setRankPhase("playing");
          }}
          onCancel={() => setRankPhase("idle")}
        />
      );
    }

    if (rankPhase === "playing" && matchData) {
      return (
        <OnlineGame
          socket={socket}
          matchData={matchData}
          currentUser={user}
          onExit={() => {
            setMatchData(null);
            setRankPhase("idle");
            onExit();
          }}
        />
      );
    }
  }

  // ── VS Friend placeholder ─────────────────────────────────────
  if (activeMode === "friend") {
    if (friendMatchData) {
      return (
        <OnlineGame
          socket={socket}
          matchData={friendMatchData}
          currentUser={user}
          onExit={() => {
            setMatchData(null);
            onExit();
          }}
        />
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-5xl">👥</div>
        <p className="font-semibold">VS Teman</p>
        <p className="text-sm text-gray-400">
          Tantang teman dari halaman{" "}
          <a href="/friends" className="text-blue-500 hover:underline">Teman</a>
        </p>
        <button onClick={onExit} className="text-sm text-gray-400 hover:underline">
          ← Kembali
        </button>
      </div>
    );
  }

  // ── VS Bot ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <button onClick={onExit} className="text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          ← Keluar
        </button>
        <span className="text-sm font-semibold">🤖 VS Bot</span>
        <div className="flex gap-1">
          {["easy", "medium", "hard"].map((d) => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); startNewSession(); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                difficulty === d
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {d === "easy" ? "Mudah" : d === "medium" ? "Sedang" : "Susah"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 overflow-auto">
        {showFlip && flipResult && <CoinFlip result={flipResult} onDone={onFlipDone} />}

        {firstPlayer && !isGameOver && (
          <p className="text-xs text-gray-400">
            Jalan pertama: {firstPlayer === "X" ? "Kamu" : "Bot"}
          </p>
        )}

        <GameStatus
          winner={winner}
          isDraw={isDraw}
          isPlayerTurn={isPlayerTurn}
          lostByTimeout={lostByTimeout}
          surrendered={surrendered}
        />

        {!isGameOver && currentPlayer !== null && (
          <Timer
            duration={15}
            isActive={isPlayerTurn}
            onTimeout={handleTimeout}
            resetKey={timerKey}
          />
        )}

        <Board board={board} onCellClick={handleCellClick} winningLine={winningLine} />

        <div className="flex gap-5 text-sm text-gray-500">
          <span>Menang: <strong className="text-green-500">{score.win}</strong></span>
          <span>Kalah: <strong className="text-red-500">{score.lose}</strong></span>
          <span>Draw: <strong className="text-yellow-500">{score.draw}</strong></span>
        </div>

        <div className="flex gap-2">
          {!isGameOver && (
            <button onClick={handleSurrender} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors">
              🏳️ Menyerah
            </button>
          )}
          {isGameOver && (
            <>
              <button onClick={nextRound} className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">
                Main Lagi
              </button>
              <button onClick={startNewSession} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors">
                Reset
              </button>
            </>
          )}
        </div>

        <RoundHistory history={history} />
      </div>
    </div>
  );
}
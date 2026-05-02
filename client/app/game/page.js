"use client";

import { useState, useEffect, useRef } from "react";
import Board from "@/components/Board";
import GameStatus from "@/components/GameStatus";
import Timer from "@/components/Timer";
import CoinFlip from "@/components/CoinFlip";
import RoundHistory from "@/components/RoundHistory";
import {
  createBoard, applyMove, checkWinner, checkDraw,
  coinFlip, determineFirstPlayer,
} from "@/lib/gameEngine";
import { getBotMove, randomMove } from "@/lib/botEngine";

export default function GamePage() {
  const [board, setBoard]               = useState(createBoard());
  const [firstPlayer, setFirstPlayer]   = useState(null);      // null = belum flip
  const [currentPlayer, setCurrentPlayer] = useState(null);    // "X" | "O"
  const [winner, setWinner]             = useState(null);
  const [winningLine, setWinningLine]   = useState(null);
  const [isDraw, setIsDraw]             = useState(false);
  const [lostByTimeout, setLostByTimeout] = useState(false);
  const [surrendered, setSurrendered]   = useState(false);
  const [difficulty, setDifficulty]     = useState("easy");
  const [score, setScore]               = useState({ win: 0, lose: 0, draw: 0 });
  const [history, setHistory]           = useState([]);
  const [timerKey, setTimerKey]         = useState(0);
  const [showFlip, setShowFlip]         = useState(false);
  const [flipResult, setFlipResult]     = useState(null);
  const [lastWinner, setLastWinner]     = useState(undefined); // undefined = belum ada ronde

  const isGameOver  = winner !== null || isDraw || lostByTimeout || surrendered;
  const isPlayerTurn = currentPlayer === "X";

  // ── Mulai sesi: flip koin ───────────────────────────────────────────────
  useEffect(() => {
    startNewSession();
  }, []);

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

  // ── Init ronde baru ─────────────────────────────────────────────────────
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

  // ── Bot move ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentPlayer === "O" && !isGameOver) {
      const delay = setTimeout(() => {
        const botIndex = getBotMove(board, difficulty);
        if (botIndex !== null) handleMove(botIndex, "O");
      }, 400);
      return () => clearTimeout(delay);
    }
  }, [currentPlayer, board, isGameOver]);

  // ── Handle move ─────────────────────────────────────────────────────────
  function handleMove(index, player) {
    const newBoard = applyMove(board, index, player);
    const { winner: w, line } = checkWinner(newBoard);
    const draw = !w && checkDraw(newBoard);

    setBoard(newBoard);
    setTimerKey((k) => k + 1); // reset timer tiap move

    if (w) {
      endRound(newBoard, w, line, "normal");
    } else if (draw) {
      endRound(newBoard, null, null, "draw");
    } else {
      setCurrentPlayer(player === "X" ? "O" : "X");
    }
  }

  function handleCellClick(index) {
    if (!isPlayerTurn || board[index] !== null || isGameOver) return;
    handleMove(index, "X");
  }

  // ── Timer habis → random move untuk player ──────────────────────────────
  function handleTimeout() {
    if (!isPlayerTurn || isGameOver) return;

    const randomIndex = randomMove(board);
    if (randomIndex !== null) {
      handleMove(randomIndex, "X");
    }
  }

  // ── Surrender ───────────────────────────────────────────────────────────
  function handleSurrender() {
    if (isGameOver) return;
    setSurrendered(true);
    setCurrentPlayer(null);
    recordResult("lose", "surrender");
    setScore((prev) => ({ ...prev, lose: prev.lose + 1 }));
    setLastWinner("O");
  }

  // ── Akhir ronde ─────────────────────────────────────────────────────────
  function endRound(finalBoard, w, line, reason) {
    setWinner(w);
    setWinningLine(line);
    if (reason === "draw") setIsDraw(true);
    setCurrentPlayer(null);
    setLastWinner(w); // null = draw

    if (w === "X") {
      recordResult("win", reason);
      setScore((prev) => ({ ...prev, win: prev.win + 1 }));
    } else if (w === "O") {
      recordResult("lose", reason);
      setScore((prev) => ({ ...prev, lose: prev.lose + 1 }));
    } else {
      recordResult("draw", reason);
      setScore((prev) => ({ ...prev, draw: prev.draw + 1 }));
    }
  }

  function recordResult(result, reason) {
    setHistory((prev) => [...prev, { result, reason }]);
  }

  // ── Main lagi (ronde berikutnya) ─────────────────────────────────────────
  function nextRound() {
    // lastWinner: "X" menang → "O" (bot) duluan, "O" menang → "X" (player) duluan, null = draw → flip lagi
    let next;
    if (lastWinner === null) {
      // draw: flip lagi tapi tanpa animasi panjang, langsung random
      next = coinFlip();
    } else {
      next = determineFirstPlayer(lastWinner);
    }
    setFirstPlayer(next);
    initRound(next);
  }

  // ── Reset sesi ────────────────────────────────────────────────────────────
  function resetSession() {
    startNewSession();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-5 p-8">
      {/* Coin flip overlay */}
      {showFlip && flipResult && (
        <CoinFlip result={flipResult} onDone={onFlipDone} />
      )}

      <h1 className="text-3xl font-bold tracking-tight">TTC Online</h1>

      {/* Difficulty */}
      <div className="flex gap-2">
        {["easy", "medium", "hard"].map((d) => (
          <button
            key={d}
            onClick={() => { setDifficulty(d); resetSession(); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              difficulty === d
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            {d === "easy" ? "Mudah" : d === "medium" ? "Sedang" : "Susah"}
          </button>
        ))}
      </div>

      {/* Siapa jalan pertama ronde ini */}
      {firstPlayer && !isGameOver && (
        <p className="text-xs text-gray-400">
          Jalan pertama ronde ini: {firstPlayer === "X" ? "Kamu" : "Bot"}
        </p>
      )}

      <GameStatus
        winner={winner}
        isDraw={isDraw}
        isPlayerTurn={isPlayerTurn}
        lostByTimeout={lostByTimeout}
        surrendered={surrendered}
      />

      {/* Timer — hanya aktif saat giliran player dan game belum selesai */}
      {!isGameOver && currentPlayer !== null && (
        <Timer
          duration={15}
          isActive={isPlayerTurn}
          onTimeout={handleTimeout}
          resetKey={timerKey}
        />
      )}

      <Board board={board} onCellClick={handleCellClick} winningLine={winningLine} />

      {/* Score */}
      <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
        <span>Menang: <strong className="text-green-500">{score.win}</strong></span>
        <span>Kalah: <strong className="text-red-500">{score.lose}</strong></span>
        <span>Draw: <strong className="text-yellow-500">{score.draw}</strong></span>
      </div>

      {/* Tombol aksi */}
      <div className="flex gap-3">
        {!isGameOver && (
          <button
            onClick={handleSurrender}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
          >
            🏳️ Menyerah
          </button>
        )}

        {isGameOver && (
          <>
            <button
              onClick={nextRound}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              Main Lagi
            </button>
            <button
              onClick={resetSession}
              className="px-5 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
            >
              Reset Sesi
            </button>
          </>
        )}
      </div>

      <RoundHistory history={history} />
    </main>
  );
}
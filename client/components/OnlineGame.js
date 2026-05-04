"use client";

import { useState, useEffect, useRef } from "react";
import Board from "./Board";
import Timer from "./Timer";
import Avatar from "./Avatar";
import CoinFlip from "./CoinFlip";

export default function OnlineGame({ socket, matchData, currentUser, onExit }) {
  const [board, setBoard]             = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState(matchData?.firstTurn || null);
  const [winner, setWinner]           = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [isDraw, setIsDraw]           = useState(false);
  const [gameOver, setGameOver]       = useState(false);
  const [endReason, setEndReason]     = useState(null);
  const [timerKey, setTimerKey]       = useState(0);
  const [pointChange, setPointChange] = useState(null);
  const [showCoinFlip, setShowCoinFlip] = useState(true);
  const [gameStarted, setGameStarted]   = useState(false);

  const initSent = useRef(false); // cegah game:init dipanggil dua kali

  const isReady   = matchData && currentUser && matchData.player1 && matchData.player2;
  const isPlayer1 = isReady ? currentUser.id === matchData.player1.id : false;
  const me        = isReady ? (isPlayer1 ? matchData.player1 : matchData.player2) : null;
  const opponent  = isReady ? (isPlayer1 ? matchData.player2 : matchData.player1) : null;
  const isMyTurn  = currentTurn === currentUser?.id;

  useEffect(() => {
    if (!socket || !isReady) return;

    socket.on("connect", () => {
      if (matchData?.roomId && !gameOver) {
        socket.emit("game:reconnect", { roomId: matchData.roomId });
      }
    });

    socket.on("game:notFound", () => {
      onExit();
    });

    socket.on("game:state", ({ board, currentTurn }) => {
      setBoard(board);
      setCurrentTurn(currentTurn);
    });

    socket.on("game:update", ({ board, currentTurn }) => {
      setBoard(board);
      setCurrentTurn(currentTurn);
      setTimerKey((k) => k + 1);
    });

    socket.on("game:over", (data) => {
      setBoard(data.board);
      setWinner(data.winner);
      setWinningLine(data.winningLine);
      setIsDraw(data.isDraw);
      setEndReason(data.reason || "normal");
      setGameOver(true);
      if (matchData.isFriendGame) {
        setPointChange(null);
      } else if (data.isDraw) {
        setPointChange(+5);
      } else if (data.winner === currentUser.id) {
        setPointChange(+25);
      } else {
        setPointChange(-15);
      }
    });

    socket.on("game:error", ({ message }) => {
      console.warn("Game error:", message);
    });

    return () => {
      socket.off("connect");
      socket.off("game:notFound");
      socket.off("game:state");
      socket.off("game:update");
      socket.off("game:over");
      socket.off("game:error");
    };
  }, [socket, isReady]);

  // game:init hanya dipanggil setelah coinflip selesai dan hanya sekali
  function handleCoinFlipDone() {
    setShowCoinFlip(false);
    setGameStarted(true);

    if (!initSent.current) {
      initSent.current = true;
      socket.emit("game:init", matchData);
    }
  }

  if (!isReady) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Menghubungkan...</p>
      </div>
    );
  }

  function handleCellClick(index) {
    if (!isMyTurn || board[index] !== null || gameOver || !gameStarted) return;
    socket.emit("game:move", { roomId: matchData.roomId, index });
  }

  function handleSurrender() {
    if (gameOver || !gameStarted) return;
    socket.emit("game:surrender", { roomId: matchData.roomId });
  }

  const winnerName = winner
    ? (winner === currentUser.id ? "Kamu" : opponent.username)
    : null;

  return (
    <div className="flex flex-col h-full">

      {/* CoinFlip overlay — hanya satu, di level atas */}
      {showCoinFlip && (
        <CoinFlip
          firstPlayer={matchData.firstTurn}
          player1={matchData.player1}
          player2={matchData.player2}
          myId={currentUser.id}
          onDone={handleCoinFlipDone}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Avatar id={opponent.avatarId || "knight"} size={32} />
          <div>
            <p className="text-sm font-medium leading-tight">{opponent.username}</p>
            <p className="text-xs text-gray-400">{opponent.points} pts · {isPlayer1 ? "O" : "X"}</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-mono">VS</span>
        <div className="flex items-center gap-2 flex-row-reverse">
          <Avatar id={me.avatarId || "knight"} size={32} />
          <div className="text-right">
            <p className="text-sm font-medium leading-tight">{me.username}</p>
            <p className="text-xs text-gray-400">{me.points} pts · {isPlayer1 ? "X" : "O"}</p>
          </div>
        </div>
      </div>

      {/* Konten */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 overflow-auto">

        {!gameOver ? (
          <p className="text-sm font-medium text-center">
            {!gameStarted
              ? "Mempersiapkan game..."
              : isMyTurn
                ? "✅ Giliran kamu"
                : `⏳ Giliran ${opponent.username}`
            }
          </p>
        ) : (
          <div className="text-center flex flex-col gap-1">
            <p className="text-lg font-bold">
              {isDraw ? "🤝 Draw!" :
               winnerName === "Kamu" ? "🎉 Kamu menang!" :
               `😔 ${winnerName} menang`}
            </p>
            {endReason === "surrender"  && <p className="text-xs text-gray-400">Lawan menyerah</p>}
            {endReason === "disconnect" && <p className="text-xs text-gray-400">Lawan disconnect</p>}
            {endReason === "timeout"    && <p className="text-xs text-gray-400">Waktu habis</p>}
            {matchData.isFriendGame && (
              <p className="text-xs text-blue-400">Mode teman — poin tidak berubah</p>
            )}
            {pointChange !== null && !matchData.isFriendGame && (
              <p className={`text-sm font-semibold ${
                pointChange > 0 ? "text-green-500" :
                pointChange < 0 ? "text-red-500" :
                "text-yellow-500"
              }`}>
                {pointChange > 0 ? `+${pointChange}` : pointChange} poin
              </p>
            )}
          </div>
        )}

        {/* Timer hanya jalan setelah gameStarted */}
        {!gameOver && gameStarted && (
          <Timer
            duration={15}
            isActive={isMyTurn}
            onTimeout={() => {}}
            resetKey={timerKey}
          />
        )}

        <Board board={board} onCellClick={handleCellClick} winningLine={winningLine} />

        <div className="flex gap-3">
          {!gameOver && gameStarted && (
            <button
              onClick={handleSurrender}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
            >
              🏳️ Menyerah
            </button>
          )}
          {gameOver && (
            <button
              onClick={onExit}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Kembali ke Lobby
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
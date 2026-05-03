"use client";

import { useState, useEffect } from "react";
import Board from "./Board";
import Timer from "./Timer";
import Avatar from "./Avatar";

export default function OnlineGame({ socket, matchData, currentUser, onExit }) {
  const [board, setBoard]           = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState(matchData.firstTurn);
  const [winner, setWinner]         = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [isDraw, setIsDraw]         = useState(false);
  const [gameOver, setGameOver]     = useState(false);
  const [endReason, setEndReason]   = useState(null);
  const [timerKey, setTimerKey]     = useState(0);
  const [pointChange, setPointChange] = useState(null);

  const isPlayer1   = currentUser.id === matchData.player1.id;
  const mySymbol    = isPlayer1 ? "X" : "O";
  const me          = isPlayer1 ? matchData.player1 : matchData.player2;
  const opponent    = isPlayer1 ? matchData.player2 : matchData.player1;
  const isMyTurn    = currentTurn === currentUser.id;

  useEffect(() => {
    // Init game di server
    socket.emit("game:init", matchData);

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

      // Hitung point change
      if (data.isDraw) setPointChange(+5);
      else if (data.winner === currentUser.id) setPointChange(+25);
      else setPointChange(-15);
    });

    socket.on("game:error", ({ message }) => {
      console.warn("Game error:", message);
    });

    return () => {
      socket.off("game:state");
      socket.off("game:update");
      socket.off("game:over");
      socket.off("game:error");
    };
  }, []);

  function handleCellClick(index) {
    if (!isMyTurn || board[index] !== null || gameOver) return;
    socket.emit("game:move", { roomId: matchData.roomId, index });
  }

  function handleSurrender() {
    socket.emit("game:surrender", { roomId: matchData.roomId });
  }

  const winnerName = winner
    ? (winner === currentUser.id ? "Kamu" : opponent.username)
    : null;

  return (
    <div className="flex flex-col h-full">

      {/* Header — info kedua player */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        {/* Opponent */}
        <div className="flex items-center gap-2">
          <Avatar id={opponent.avatarId || "knight"} size={32} />
          <div>
            <p className="text-sm font-medium leading-tight">{opponent.username}</p>
            <p className="text-xs text-gray-400">{opponent.points} pts · O</p>
          </div>
        </div>

        <span className="text-xs text-gray-400 font-mono">VS</span>

        {/* Me */}
        <div className="flex items-center gap-2 flex-row-reverse">
          <Avatar id={me.avatarId || "knight"} size={32} />
          <div className="text-right">
            <p className="text-sm font-medium leading-tight">{me.username}</p>
            <p className="text-xs text-gray-400">{me.points} pts · X</p>
          </div>
        </div>
      </div>

      {/* Konten game */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 overflow-auto">

        {/* Status */}
        {!gameOver ? (
          <p className="text-sm font-medium text-center">
            {isMyTurn ? "✅ Giliran kamu" : `⏳ Giliran ${opponent.username}`}
          </p>
        ) : (
          <div className="text-center flex flex-col gap-1">
            <p className="text-lg font-bold">
              {isDraw ? "🤝 Draw!" :
               winnerName === "Kamu" ? "🎉 Kamu menang!" :
               `😔 ${winnerName} menang`}
            </p>
            {endReason === "surrender" && <p className="text-xs text-gray-400">Lawan menyerah</p>}
            {endReason === "disconnect" && <p className="text-xs text-gray-400">Lawan disconnect</p>}
            {endReason === "timeout" && <p className="text-xs text-gray-400">Waktu habis</p>}
            {pointChange !== null && (
              <p className={`text-sm font-semibold ${pointChange > 0 ? "text-green-500" : pointChange < 0 ? "text-red-500" : "text-yellow-500"}`}>
                {pointChange > 0 ? `+${pointChange}` : pointChange} poin
              </p>
            )}
          </div>
        )}

        {/* Timer — hanya saat giliran kita */}
        {!gameOver && (
          <Timer
            duration={15}
            isActive={isMyTurn}
            onTimeout={() => {}} // server yang handle timeout
            resetKey={timerKey}
          />
        )}

        <Board
          board={board}
          onCellClick={handleCellClick}
          winningLine={winningLine}
        />

        {/* Aksi */}
        <div className="flex gap-3">
          {!gameOver && (
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
import Cell from "./Cell";

export default function Board({ board, onCellClick, winningLine }) {
  return (
    <div className="grid grid-cols-3 w-72 h-72 border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
      {board.map((value, index) => {
        const isEdgeRight = (index + 1) % 3 !== 0;
        const isEdgeBottom = index < 6;

        return (
          <div
            key={index}
            className={[
              isEdgeRight ? "border-r-2 border-gray-300 dark:border-gray-600" : "",
              isEdgeBottom ? "border-b-2 border-gray-300 dark:border-gray-600" : "",
            ].join(" ")}
          >
            <Cell
              value={value}
              index={index}
              onClick={onCellClick}
              isWinning={winningLine?.includes(index) ?? false}
            />
          </div>
        );
      })}
    </div>
  );
}
export default function Cell({ value, index, onClick, isWinning }) {
  const baseStyle =
    "w-full h-full flex items-center justify-center text-5xl font-bold cursor-pointer transition-colors duration-150 select-none";

  const colorMap = {
    X: "text-blue-500",
    O: "text-rose-500",
  };

  const bgStyle = isWinning ? "bg-yellow-100 dark:bg-yellow-900/30" : "hover:bg-gray-100 dark:hover:bg-white/5";

  return (
    <div className={`${baseStyle} ${bgStyle} ${colorMap[value] ?? ""}`} onClick={() => onClick(index)}>
      {value}
    </div>
  );
}

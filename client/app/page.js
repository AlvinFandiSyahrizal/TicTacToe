import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">TTC Online</h1>
      <p className="text-gray-500">Tic Tac Toe yang beda dari biasanya</p>
      <Link
        href="/game"
        className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-lg transition-colors"
      >
        Main Sekarang
      </Link>
    </main>
  );
}

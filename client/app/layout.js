import { Geist } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "TTC Online",
  description: "Tic Tac Toe Online",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${geist.className} bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
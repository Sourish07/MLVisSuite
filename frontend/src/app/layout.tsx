import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from 'next/link';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ML Visualization Suite",
  description: "Interactive visualizations for ML algorithms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <nav className="bg-white dark:bg-gray-800 shadow-md p-4 mb-6">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              ML Visualization Suite
            </Link>
            <div className="space-x-4">
              <Link href="/linear-regression" className="hover:text-blue-500 dark:hover:text-blue-300">Linear Regression</Link>
              <Link href="/logistic-regression" className="hover:text-blue-500 dark:hover:text-blue-300">Logistic Regression</Link>
              <Link href="/kmeans" className="hover:text-blue-500 dark:hover:text-blue-300">K-Means</Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
        <footer className="text-center mt-8 py-4 text-gray-500 dark:text-gray-400 text-sm">
          Built as an educational tool.
        </footer>
      </body>
    </html>
  );
}

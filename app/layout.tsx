import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Nurul Aldi\'s Portfolio',
    template: '%s | Portfolio'
  },
  description: 'Professional portfolio showcasing data engineering projects and expertise in ETL, Data Warehousing, Big Data, and Cloud Infrastructure',
  keywords: ['data engineer', 'big data', 'data pipeline', 'etl', 'python', 'sql', 'portfolio'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

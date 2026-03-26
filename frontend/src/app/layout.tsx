import type { Metadata } from 'next';
import './globals.css';
import { PlanProvider } from '../context/PlanContext';
import Navigation from '../components/layout/Navigation';

export const metadata: Metadata = {
  title: '夫婦のライフプランナー',
  description: '夫婦向けライフプラン・キャリア設計アプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="font-sans">
        <PlanProvider>
          <Navigation />
          <main>{children}</main>
        </PlanProvider>
      </body>
    </html>
  );
}

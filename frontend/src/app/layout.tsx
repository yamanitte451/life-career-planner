import type { Metadata } from 'next';
import './globals.css';
import { PlanProvider } from '../context/PlanContext';

export const metadata: Metadata = {
  title: '夫婦のライフプランナー',
  description: '夫婦向けライフプラン・キャリア設計アプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="font-sans">
        <PlanProvider>
          <nav className="bg-indigo-700 text-white px-6 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold">💑 ライフプランナー</a>
            <div className="flex gap-4 text-sm">
              <a href="/setup" className="hover:text-indigo-200">プラン設定</a>
              <a href="/dashboard" className="hover:text-indigo-200">ダッシュボード</a>
              <a href="/chat" className="hover:text-indigo-200">AI相談</a>
            </div>
          </nav>
          <main>{children}</main>
        </PlanProvider>
      </body>
    </html>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/setup', label: 'プラン設定' },
  { href: '/dashboard', label: 'ダッシュボード' },
  { href: '/chat', label: 'AI相談' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // ページ遷移時にメニューを閉じる
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-indigo-700 text-white px-6 py-3 flex items-center justify-between relative">
      <Link href="/" className="text-xl font-bold">💑 ライフプランナー</Link>

      {/* デスクトップ: 通常リンク */}
      <div className="hidden md:flex gap-4 text-sm">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`hover:text-indigo-200 transition-colors ${
              pathname === link.href ? 'text-indigo-200 font-semibold' : ''
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* モバイル: ハンバーガーボタン */}
      <button
        className="md:hidden p-1 rounded hover:bg-indigo-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
        aria-expanded={isOpen}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {isOpen ? (
            <>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </>
          ) : (
            <>
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* モバイル: ドロップダウンメニュー */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            role="button"
            aria-label="メニューを閉じる"
            tabIndex={-1}
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setIsOpen(false); }}
          />
          <div className="absolute top-full right-0 left-0 bg-indigo-700 border-t border-indigo-600 z-50 md:hidden shadow-lg">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-6 py-3 text-sm hover:bg-indigo-600 transition-colors border-b border-indigo-600 ${
                  pathname === link.href ? 'bg-indigo-600 font-semibold' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </nav>
  );
}

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="text-6xl mb-6">💑</div>
        <h1 className="text-4xl font-bold text-indigo-800 mb-4">
          夫婦のライフプランナー
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          二人の収入・支出・資産を入力して、<br />
          将来の資産推移をシミュレーションしましょう。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/setup"
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition"
          >
            プランを始める →
          </Link>
          <Link
            href="/dashboard"
            className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition"
          >
            ダッシュボードを見る
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: '👤', label: '基本情報' },
            { icon: '💰', label: '収入・支出' },
            { icon: '🏦', label: '資産・負債' },
            { icon: '📈', label: '将来シミュレーション' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

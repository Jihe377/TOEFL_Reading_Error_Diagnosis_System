import { useNavigate } from 'react-router-dom'

const CARDS = [
  {
    title: '录入题目',
    desc: '添加机经集、文章与题目',
    path: '/admin',
    border: 'border-teal-600',
    hover: 'hover:bg-teal-50',
    titleColor: 'text-teal-700 group-hover:text-teal-800',
  },
  {
    title: '查看机经',
    desc: '浏览已录入的机经题目',
    path: '/jijing',
    border: 'border-blue-500',
    hover: 'hover:bg-blue-50',
    titleColor: 'text-blue-700 group-hover:text-blue-800',
  },
  {
    title: '开始练习',
    desc: '按题型选题并进行复盘诊断',
    path: '/practice',
    border: 'border-violet-500',
    hover: 'hover:bg-violet-50',
    titleColor: 'text-violet-700 group-hover:text-violet-800',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-teal-700 text-white px-8 py-4">
        <span className="text-xl font-bold tracking-wide">*toefl ibt</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">TOEFL Reading</h1>
          <p className="text-gray-500 text-sm">选择模式开始</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {CARDS.map((card) => (
            <button
              key={card.path}
              onClick={() => navigate(card.path)}
              className={`w-64 bg-white border-2 ${card.border} ${card.hover} rounded-2xl p-8 text-left transition-colors group`}
            >
              <h2 className={`text-lg font-semibold mb-1 ${card.titleColor}`}>{card.title}</h2>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

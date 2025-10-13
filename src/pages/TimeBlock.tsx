import { useParams } from 'react-router-dom';
import { 
  Play, Pause, Plus, Camera, Music, Lightbulb,
  TrendingUp, Clock, Target, CheckCircle2
} from 'lucide-react';

const timeBlockData: Record<string, any> = {
  '0900': {
    time: '9:00 AM',
    title: 'Peak Performance',
    subtitle: 'Your golden hour for deep work',
    icon: '🎯',
    color: 'from-blue-500 to-cyan-400',
    activities: [
      'Start 90-min deep work session',
      'Tackle your Most Important Task (MIT)',
      'Single-task focus mode',
      'No meetings or distractions'
    ],
    aiInsight: "You're 40% more productive now than at 2 PM. Tackle your hardest task during this window!",
    stats: {
      thisWeek: '12.5 hrs',
      target: '15 hrs',
      tasksCompleted: '24/30',
      avgFocus: '85%'
    }
  },
  '0700': {
    time: '7:00 AM',
    title: 'Movement',
    subtitle: 'Energize your body and mind',
    icon: '💪',
    color: 'from-red-500 to-orange-400',
    activities: [
      'Morning workout session',
      'Cardio or strength training',
      'Stretch and mobility work',
      'Track your progress'
    ],
    aiInsight: "Morning workouts have 50% better adherence. You burn 20% more fat exercising before breakfast!",
    stats: {
      thisWeek: '5 workouts',
      target: '5 workouts',
      avgDuration: '45 min',
      caloriesBurned: '2,150'
    }
  },
  // Add more time blocks as needed
};

export default function TimeBlock() {
  const { timeId } = useParams();
  const data = timeBlockData[timeId || '0900'] || timeBlockData['0900'];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className={`bg-gradient-to-r ${data.color} rounded-2xl p-8 mb-8 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-medium opacity-90 mb-2">{data.time}</div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span className="text-5xl">{data.icon}</span>
              {data.title}
            </h1>
            <p className="text-lg opacity-90">{data.subtitle}</p>
          </div>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-medium transition">
            Start Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timer Card */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Session Timer
            </h3>
            <div className="text-center py-8">
              <div className="text-6xl font-bold mb-4">90:00</div>
              <div className="flex items-center justify-center gap-4">
                <button className="bg-green-500 hover:bg-green-600 p-4 rounded-full transition">
                  <Play className="w-6 h-6" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-4 rounded-full transition">
                  <Pause className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Today's Focus */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              Today's Focus
            </h3>
            <div className="space-y-3">
              {data.activities.map((activity: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span>{activity}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
              <Plus className="w-5 h-5" />
              Add Task
            </button>
          </div>

          {/* AI Insight */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              AI Insight
            </h3>
            <p className="text-gray-300 leading-relaxed">{data.aiInsight}</p>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* This Week's Stats */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              This Week's Stats
            </h3>
            <div className="space-y-4">
              {Object.entries(data.stats).map(([key, value], idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-sm font-bold">{value as string}</span>
                  </div>
                  {idx === 0 && (
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '83%' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Focus Playlist */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              Focus Playlist
            </h3>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition">
              <Play className="w-5 h-5" />
              Play Deep Focus Mix
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 py-2 px-3 bg-white/5 hover:bg-white/10 rounded-lg transition">
                <Plus className="w-4 h-4" />
                <span className="text-sm">Log Task</span>
              </button>
              <button className="w-full flex items-center gap-2 py-2 px-3 bg-white/5 hover:bg-white/10 rounded-lg transition">
                <Camera className="w-4 h-4" />
                <span className="text-sm">Add Photo</span>
              </button>
              <button className="w-full flex items-center gap-2 py-2 px-3 bg-white/5 hover:bg-white/10 rounded-lg transition">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Start Timer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

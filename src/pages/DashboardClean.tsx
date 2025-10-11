import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Droplet,
  Target,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  Moon,
  Coffee,
  Dumbbell,
  Book,
  Heart,
  ChevronRight,
  Plus,
  Bell,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function DashboardClean() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [todayProgress, setTodayProgress] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user preferences and today's data
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserData(preferences);

      // Load today's progress (mocked for now)
      setTodayProgress({
        calories: 1247,
        caloriesGoal: 2000,
        protein: 87,
        proteinGoal: 150,
        water: 48,
        waterGoal: 64,
        workoutDone: false,
        sleepHours: 7.5,
        tasksCompleted: 5,
        tasksTotal: 8
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FitFlow</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search meals, workouts, tasks..."
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border-0 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="w-5 h-5 text-gray-700" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="w-5 h-5 text-gray-700" />
              </Button>
              <Avatar className="w-10 h-10 cursor-pointer">
                <AvatarImage src="/avatar.jpg" />
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  {userData?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {getGreeting()}, {userData?.name || 'Champion'}!
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {currentTime} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Daily Goals Progress - Hero Section */}
        <div className="mb-8">
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Today's Goals</h2>
                  <p className="text-sm text-gray-600">
                    {todayProgress?.tasksCompleted || 0} of {todayProgress?.tasksTotal || 0} tasks completed
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  <Target className="w-3 h-3 mr-1" />
                  {userData?.primary_goal || 'Health'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Calories */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Calories</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {todayProgress?.calories || 0}/{todayProgress?.caloriesGoal || 2000}
                    </span>
                  </div>
                  <Progress 
                    value={(todayProgress?.calories / todayProgress?.caloriesGoal) * 100} 
                    className="h-2 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {todayProgress?.caloriesGoal - todayProgress?.calories || 0} cal remaining
                  </p>
                </div>

                {/* Protein */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Dumbbell className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Protein</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {todayProgress?.protein || 0}g/{todayProgress?.proteinGoal || 150}g
                    </span>
                  </div>
                  <Progress 
                    value={(todayProgress?.protein / todayProgress?.proteinGoal) * 100} 
                    className="h-2 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {todayProgress?.proteinGoal - todayProgress?.protein || 0}g to go
                  </p>
                </div>

                {/* Water */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                        <Droplet className="w-4 h-4 text-cyan-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Water</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {todayProgress?.water || 0}oz/{todayProgress?.waterGoal || 64}oz
                    </span>
                  </div>
                  <Progress 
                    value={(todayProgress?.water / todayProgress?.waterGoal) * 100} 
                    className="h-2 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {todayProgress?.waterGoal - todayProgress?.water || 0}oz left
                  </p>
                </div>

                {/* Sleep */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Moon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Sleep</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {todayProgress?.sleepHours || 0}h/8h
                    </span>
                  </div>
                  <Progress 
                    value={(todayProgress?.sleepHours / 8) * 100} 
                    className="h-2 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Last night's sleep
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Coffee, label: 'Log Meal', color: 'bg-amber-50 text-amber-700', path: '/food-diary' },
              { icon: Dumbbell, label: 'Log Workout', color: 'bg-red-50 text-red-700', path: '/workout-logger' },
              { icon: CheckCircle2, label: 'Add Task', color: 'bg-green-50 text-green-700', path: '/tasks' },
              { icon: Book, label: 'Journal', color: 'bg-purple-50 text-purple-700', path: '/journal' }
            ].map((action, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Your Day Timeline - DoorDash Style Horizontal Scroll */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Day</h2>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[
              {
                time: '6:00 AM',
                title: 'Morning Routine',
                icon: '🌅',
                status: 'completed',
                tasks: ['Hydrate', 'Meditate', 'Journal']
              },
              {
                time: '8:00 AM',
                title: 'Breakfast',
                icon: '🍳',
                status: 'completed',
                tasks: ['Log meal', 'Track macros']
              },
              {
                time: '9:00 AM',
                title: 'Deep Work',
                icon: '💼',
                status: 'active',
                tasks: ['3 Priority Tasks', 'Focus Mode']
              },
              {
                time: '12:00 PM',
                title: 'Lunch Break',
                icon: '🍽️',
                status: 'upcoming',
                tasks: ['Menu scan', 'Log meal']
              },
              {
                time: '3:00 PM',
                title: 'Workout',
                icon: '💪',
                status: 'upcoming',
                tasks: ['45 min strength', 'Log workout']
              },
              {
                time: '6:00 PM',
                title: 'Dinner & Family',
                icon: '👨‍👩‍👧',
                status: 'upcoming',
                tasks: ['Cook meal', 'Family time']
              },
              {
                time: '9:00 PM',
                title: 'Evening Routine',
                icon: '🌙',
                status: 'upcoming',
                tasks: ['Reflect', 'Read', 'Wind down']
              }
            ].map((slot, idx) => (
              <Card 
                key={idx}
                className={`flex-shrink-0 w-72 border cursor-pointer hover:shadow-md transition-shadow ${
                  slot.status === 'active' 
                    ? 'border-blue-500 shadow-md' 
                    : slot.status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-600">{slot.time}</span>
                    {slot.status === 'completed' && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {slot.status === 'active' && (
                      <Badge className="bg-blue-600">Now</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{slot.icon}</span>
                    <h3 className="text-lg font-bold text-gray-900">{slot.title}</h3>
                  </div>
                  <div className="space-y-1">
                    {slot.tasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          slot.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Two Column Layout - Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Priority Tasks & Sleep */}
          <div className="lg:col-span-2 space-y-6">
            {/* Priority Tasks for Today */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Priority Tasks</h3>
                    <p className="text-sm text-gray-600">3 Most Important Things Today</p>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Task
                  </Button>
                </div>

                <div className="space-y-3">
                  {[
                    { task: 'Complete project proposal', priority: 'high', done: true },
                    { task: 'Team meeting at 2 PM', priority: 'high', done: false },
                    { task: 'Review quarterly goals', priority: 'medium', done: false }
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        item.done 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          item.done 
                            ? 'border-green-600 bg-green-600' 
                            : 'border-gray-300'
                        }`}>
                          {item.done && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${
                            item.done ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {item.task}
                          </p>
                        </div>
                        <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                          {item.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="ghost" className="w-full mt-4 text-blue-600">
                  View All Tasks <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Last Night's Sleep */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Last Night's Sleep</h3>
                    <p className="text-sm text-gray-600">How did you rest?</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate('/sleep-tracker')}
                  >
                    Log Sleep
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-indigo-50">
                    <Moon className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-gray-900">7.5h</p>
                    <p className="text-xs text-gray-600">Duration</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50">
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-gray-900">85%</p>
                    <p className="text-xs text-gray-600">Quality</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50">
                    <Heart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-gray-900">Good</p>
                    <p className="text-xs text-gray-600">Feeling</p>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-700">
                    <strong>💡 Insight:</strong> You slept 30 minutes longer than your average. Great work maintaining consistency!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Insights & Reminders */}
          <div className="space-y-6">
            {/* Today's Insights */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Insights</h3>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-sm font-semibold text-blue-900 mb-1">☀️ Peak Energy Time</p>
                    <p className="text-xs text-blue-700">Your best focus: 9-11 AM. Schedule deep work now!</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                    <p className="text-sm font-semibold text-green-900 mb-1">💪 Workout Reminder</p>
                    <p className="text-xs text-green-700">3 PM is your best workout time based on patterns.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                    <p className="text-sm font-semibold text-orange-900 mb-1">🥗 Nutrition Tip</p>
                    <p className="text-xs text-orange-700">Add 30g protein at lunch to hit your goal.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Reminders */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming</h3>
                <div className="space-y-3">
                  {[
                    { time: '12:00 PM', task: 'Lunch break', icon: '🍽️' },
                    { time: '2:00 PM', task: 'Team meeting', icon: '👥' },
                    { time: '3:00 PM', task: 'Workout time', icon: '💪' },
                    { time: '9:00 PM', task: 'Evening reflection', icon: '🌙' }
                  ].map((reminder, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <span className="text-2xl">{reminder.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{reminder.task}</p>
                        <p className="text-xs text-gray-600">{reminder.time}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Streak & Achievements */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Streaks</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔥</span>
                      <span className="text-sm font-semibold text-gray-900">Daily Check-in</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">15 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💪</span>
                      <span className="text-sm font-semibold text-gray-900">Workout Streak</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">7 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">😴</span>
                      <span className="text-sm font-semibold text-gray-900">Sleep Goal</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">12 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

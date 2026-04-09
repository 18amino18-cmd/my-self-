import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Award,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Scale,
  Moon,
  Target,
  Sun,
  Sunrise,
  Sunset,
  BookOpen,
  Dumbbell,
  Heart,
  Zap,
  Utensils,
  Ban,
  Pill,
  GraduationCap,
  Languages,
  Mic2,
  Lightbulb,
  Wallet,
  Beef,
  Video,
  Swords,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Habit {
  id: string;
  name: string;
  category: string;
  completedDays: string[]; // ISO date strings
}

interface WeightEntry {
  date: string; // ISO date string
  value: number;
}

const DEFAULT_HABITS: Habit[] = [
  // الجانب الديني
  { id: '1', name: 'الصلوات الخمس', category: 'ديني', completedDays: [] },
  { id: '2', name: 'قيام الليل', category: 'ديني', completedDays: [] },
  { id: '3', name: 'أذكار الصباح', category: 'ديني', completedDays: [] },
  { id: '4', name: 'أذكار المساء', category: 'ديني', completedDays: [] },
  { id: '5', name: 'تسبيح', category: 'ديني', completedDays: [] },
  { id: '6', name: 'قراءة القرآن', category: 'ديني', completedDays: [] },
  { id: '7', name: 'الصيام', category: 'ديني', completedDays: [] },
  // الجانب الصحي والرياضي
  { id: '8', name: 'فن قتالي', category: 'رياضي', completedDays: [] },
  { id: '9', name: 'كارديو', category: 'رياضي', completedDays: [] },
  { id: '10', name: 'بناء الأجسام', category: 'رياضي', completedDays: [] },
  { id: '11', name: 'تغذية صحية', category: 'صحي', completedDays: [] },
  { id: '12', name: 'زيرو سكر', category: 'صحي', completedDays: [] },
  { id: '13', name: 'مكملات غذائية', category: 'صحي', completedDays: [] },
  // الجانب الدراسي
  { id: '14', name: 'دراسة مادة', category: 'دراسي', completedDays: [] },
  { id: '15', name: 'تعلم لغة', category: 'دراسي', completedDays: [] },
  { id: '16', name: 'استماع إلى بودكاست', category: 'دراسي', completedDays: [] },
  { id: '17', name: 'تعلم مهارة', category: 'دراسي', completedDays: [] },
  // الجانب المالي
  { id: '18', name: 'الادخار', category: 'مالي', completedDays: [] },
  { id: '19', name: 'مشروع تربية الأغنام', category: 'مالي', completedDays: [] },
  { id: '20', name: 'صناعة المحتوى', category: 'مالي', completedDays: [] },
];

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : DEFAULT_HABITS;
  });
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(() => {
    const saved = localStorage.getItem('weightEntries');
    return saved ? JSON.parse(saved) : [{ date: format(new Date(), 'yyyy-MM-dd'), value: 75 }];
  });

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('weightEntries', JSON.stringify(weightEntries));
  }, [weightEntries]);

  const [newWeight, setNewWeight] = useState('');
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('عام');
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const toggleDay = (habitId: string, day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDays.includes(dateStr);
        return {
          ...habit,
          completedDays: isCompleted 
            ? habit.completedDays.filter(d => d !== dateStr)
            : [...habit.completedDays, dateStr]
        };
      }
      return habit;
    }));
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: newHabitName,
      category: newHabitCategory,
      completedDays: []
    };
    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  const removeHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const stats = useMemo(() => {
    const totalPossible = habits.length * daysInMonth.length;
    const totalCompleted = habits.reduce((acc, h) => {
      // Only count completions within the current month
      const currentMonthCompletions = h.completedDays.filter(d => {
        const date = new Date(d);
        return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
      });
      return acc + currentMonthCompletions.length;
    }, 0);
    
    const percentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    
    return {
      totalCompleted,
      totalPossible,
      percentage
    };
  }, [habits, daysInMonth, currentDate]);

  const addWeight = () => {
    if (!newWeight || isNaN(Number(newWeight))) return;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const existingIndex = weightEntries.findIndex(e => e.date === dateStr);
    
    if (existingIndex >= 0) {
      const updated = [...weightEntries];
      updated[existingIndex].value = Number(newWeight);
      setWeightEntries(updated);
    } else {
      setWeightEntries([...weightEntries, { date: dateStr, value: Number(newWeight) }]);
    }
    setNewWeight('');
  };

  const getHabitProgress = (habit: Habit) => {
    const currentMonthCompletions = habit.completedDays.filter(d => {
      const date = new Date(d);
      return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
    });
    return Math.round((currentMonthCompletions.length / daysInMonth.length) * 100);
  };

  const weightChartData = useMemo(() => {
    return weightEntries
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(entry => ({
        ...entry,
        formattedDate: format(parseISO(entry.date), 'd MMM', { locale: ar })
      }));
  }, [weightEntries]);

  const tableRows = useMemo(() => {
    const categories = Array.from(new Set(habits.map(h => h.category))) as string[];
    const rows: ({ type: 'header'; category: string } | { type: 'habit'; habit: Habit })[] = [];
    
    categories.forEach(category => {
      rows.push({ type: 'header', category });
      habits
        .filter(h => h.category === category)
        .forEach(habit => {
          rows.push({ type: 'habit', habit });
        });
    });
    return rows;
  }, [habits]);

  const getHabitIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('صلاة') || n.includes('صلوات')) return <Sun className="w-4 h-4" />;
    if (n.includes('ليل')) return <Moon className="w-4 h-4" />;
    if (n.includes('صباح')) return <Sunrise className="w-4 h-4" />;
    if (n.includes('مساء')) return <Sunset className="w-4 h-4" />;
    if (n.includes('قرآن')) return <BookOpen className="w-4 h-4" />;
    if (n.includes('فن قتالي')) return <Swords className="w-4 h-4" />;
    if (n.includes('كارديو')) return <Zap className="w-4 h-4" />;
    if (n.includes('بناء') || n.includes('أجسام')) return <Dumbbell className="w-4 h-4" />;
    if (n.includes('تغذية')) return <Utensils className="w-4 h-4" />;
    if (n.includes('سكر')) return <Ban className="w-4 h-4" />;
    if (n.includes('مكملات')) return <Pill className="w-4 h-4" />;
    if (n.includes('دراسة')) return <GraduationCap className="w-4 h-4" />;
    if (n.includes('لغة')) return <Languages className="w-4 h-4" />;
    if (n.includes('بودكاست')) return <Mic2 className="w-4 h-4" />;
    if (n.includes('مهارة')) return <Lightbulb className="w-4 h-4" />;
    if (n.includes('ادخار')) return <Wallet className="w-4 h-4" />;
    if (n.includes('أغنام')) return <Beef className="w-4 h-4" />;
    if (n.includes('محتوى')) return <Video className="w-4 h-4" />;
    return <CheckCircle2 className="w-4 h-4" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ديني': return <Award className="w-4 h-4" />;
      case 'رياضي': return <Dumbbell className="w-4 h-4" />;
      case 'صحي': return <Heart className="w-4 h-4" />;
      case 'دراسي': return <GraduationCap className="w-4 h-4" />;
      case 'مالي': return <Wallet className="w-4 h-4" />;
      default: return <Settings2 className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ديني':
        return {
          bg: 'bg-emerald-500',
          text: 'text-emerald-700',
          lightBg: 'bg-emerald-50/80',
          border: 'border-emerald-100',
          shadow: 'shadow-emerald-100',
          ring: 'ring-emerald-500/20'
        };
      case 'رياضي':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-700',
          lightBg: 'bg-blue-50/80',
          border: 'border-blue-100',
          shadow: 'shadow-blue-100',
          ring: 'ring-blue-500/20'
        };
      case 'صحي':
        return {
          bg: 'bg-rose-500',
          text: 'text-rose-700',
          lightBg: 'bg-rose-50/80',
          border: 'border-rose-100',
          shadow: 'shadow-rose-100',
          ring: 'ring-rose-500/20'
        };
      case 'دراسي':
        return {
          bg: 'bg-amber-500',
          text: 'text-amber-700',
          lightBg: 'bg-amber-50/80',
          border: 'border-amber-100',
          shadow: 'shadow-amber-100',
          ring: 'ring-amber-500/20'
        };
      case 'مالي':
        return {
          bg: 'bg-indigo-500',
          text: 'text-indigo-700',
          lightBg: 'bg-indigo-50/80',
          border: 'border-indigo-100',
          shadow: 'shadow-indigo-100',
          ring: 'ring-indigo-500/20'
        };
      default:
        return {
          bg: 'bg-slate-500',
          text: 'text-slate-700',
          lightBg: 'bg-slate-50/80',
          border: 'border-slate-100',
          shadow: 'shadow-slate-100',
          ring: 'ring-slate-500/20'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 rotate-3">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-emerald-700">تتبع العادات</h1>
            </div>
            <p className="text-lg text-slate-500 font-medium italic">
              "استبدل أمنياتك بعادات وراقب كيف تتغير حياتك"
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-2 px-4 font-bold text-lg min-w-[140px] justify-center">
              <CalendarIcon className="w-5 h-5 text-emerald-600" />
              {format(currentDate, 'MMMM yyyy', { locale: ar })}
            </div>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">نسبة النجاح</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.percentage}%</h3>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">الأيام المنجزة</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.totalCompleted}</h3>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">الهدف الكلي</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.totalPossible}</h3>
            </div>
          </motion.div>
        </div>

        {/* Main Tracker Grid */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold">جدول المتابعة الشهري</h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select 
                value={newHabitCategory}
                onChange={(e) => setNewHabitCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
              >
                <option value="ديني">ديني</option>
                <option value="رياضي">رياضي</option>
                <option value="صحي">صحي</option>
                <option value="دراسي">دراسي</option>
                <option value="مالي">مالي</option>
                <option value="عام">عام</option>
              </select>
              <input 
                type="text" 
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="أضف عادة جديدة..."
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-w-[200px]"
                onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              />
              <button 
                onClick={addHabit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition-all shadow-lg shadow-emerald-200 active:scale-95"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="sticky right-0 z-10 bg-slate-50/50 p-4 text-right font-bold text-slate-500 border-b border-slate-100 min-w-[200px]">العادة</th>
                  <th className="p-4 text-center font-bold text-slate-500 border-b border-slate-100 min-w-[120px]">التقدم</th>
                  {daysInMonth.map((day) => (
                    <th key={day.toString()} className="p-2 text-center border-b border-slate-100 min-w-[40px]">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">{format(day, 'EEE', { locale: ar })}</span>
                        <span className="text-sm font-bold text-slate-600">{format(day, 'd')}</span>
                      </div>
                    </th>
                  ))}
                  <th className="p-4 border-b border-slate-100"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {tableRows.map((row) => {
                    if (row.type === 'header') {
                      const colors = getCategoryColor(row.category);
                      return (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={`header-${row.category}`} 
                          className={cn(colors.lightBg)}
                        >
                          <td colSpan={daysInMonth.length + 3} className={cn("p-3 px-6 text-sm font-black uppercase tracking-widest border-b border-slate-200", colors.text)}>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(row.category)}
                              {row.category}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    }

                    const { habit } = row;
                    const colors = getCategoryColor(habit.category);
                    const progress = getHabitProgress(habit);
                    
                    return (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        key={habit.id} 
                        className="group hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="sticky right-0 z-10 bg-white group-hover:bg-slate-50/30 p-4 font-bold text-slate-700 border-b border-slate-50">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-1.5 rounded-lg", colors.lightBg, colors.text)}>
                              {getHabitIcon(habit.name)}
                            </div>
                            {habit.name}
                          </div>
                        </td>
                        <td className="p-4 border-b border-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  colors.bg
                                )}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-500 w-8">{progress}%</span>
                          </div>
                        </td>
                        {daysInMonth.map((day) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const isCompleted = habit.completedDays.includes(dateStr);
                          const isToday = isSameDay(day, new Date());
                          
                          return (
                            <td key={day.toString()} className="p-1 border-b border-slate-50 text-center">
                              <button
                                onClick={() => toggleDay(habit.id, day)}
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90",
                                  isCompleted 
                                    ? cn(colors.bg, "text-white shadow-md", colors.shadow) 
                                    : "bg-slate-50 text-slate-200 hover:bg-slate-100 hover:text-slate-300",
                                  isToday && !isCompleted && cn("ring-2 border", colors.ring, colors.border)
                                )}
                              >
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                              </button>
                            </td>
                          );
                        })}
                        <td className="p-4 border-b border-slate-50 text-center">
                          <button 
                            onClick={() => removeHabit(habit.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {habits.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <Plus className="w-10 h-10" />
              </div>
              <p className="text-slate-400 font-medium">لم تقم بإضافة أي عادات بعد. ابدأ الآن!</p>
            </div>
          )}
        </div>

        {/* Weight Tracking Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scale className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">منحنى تتبع الوزن</h2>
              </div>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="الوزن الحالي (كجم)"
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-32"
                />
                <button 
                  onClick={addWeight}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95 text-sm font-bold"
                >
                  تحديث
                </button>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightChartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="formattedDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    reversed
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    domain={['dataMin - 5', 'dataMax + 5']}
                    orientation="right"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      direction: 'rtl'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                    name="الوزن"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800">ملخص الوزن</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500">الوزن الحالي</span>
                  <span className="text-2xl font-black text-blue-600">
                    {weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].value : '--'} 
                    <small className="text-sm font-normal text-slate-400 mr-1">كجم</small>
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500">التغير هذا الشهر</span>
                  <span className={cn(
                    "text-lg font-bold",
                    weightEntries.length > 1 && weightEntries[weightEntries.length - 1].value < weightEntries[0].value 
                      ? "text-emerald-600" 
                      : "text-rose-600"
                  )}>
                    {weightEntries.length > 1 
                      ? (weightEntries[weightEntries.length - 1].value - weightEntries[0].value).toFixed(1)
                      : '0.0'}
                    <small className="text-sm font-normal mr-1">كجم</small>
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mt-6">
              يتم تحديث المنحنى تلقائياً عند إضافة قياسات جديدة. استمر في مراقبة تقدمك للوصول إلى هدفك المثالي.
            </p>
          </div>
        </section>

        {/* Analysis Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h2 className="text-2xl font-bold">التحليل الشهري</h2>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-emerald-300 text-sm font-bold uppercase tracking-widest">أفضل عادة</p>
                  <p className="text-xl font-bold">
                    {habits.length > 0 
                      ? habits.reduce((prev, current) => (getHabitProgress(prev) > getHabitProgress(current)) ? prev : current).name
                      : '---'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-emerald-300 text-sm font-bold uppercase tracking-widest">أيام الالتزام</p>
                  <p className="text-xl font-bold">{stats.totalCompleted} يوم</p>
                </div>
              </div>
              <div className="pt-4 border-t border-emerald-800 flex items-center justify-between">
                <p className="text-emerald-200 text-sm">أداء ممتاز هذا الشهر! استمر في التقدم.</p>
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-800/50 rounded-full blur-3xl" />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center space-y-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-100"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={364}
                  initial={{ strokeDashoffset: 364 }}
                  animate={{ strokeDashoffset: 364 - (364 * stats.percentage) / 100 }}
                  className="text-emerald-500"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-2xl font-black text-slate-800">{stats.percentage}%</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">معدل الإنجاز العام</h3>
              <p className="text-slate-500 text-sm">بناء العادات يحتاج إلى وقت وصبر.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

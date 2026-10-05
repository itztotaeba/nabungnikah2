import { useState, useMemo } from 'react';
import { useWeddingStore, Task, TaskCategory, TaskAssignee } from '../store';
import { calculateRemainingMonths } from '../helpers';
import { useToastStore } from '../toastStore';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  X,
  User,
  Users,
} from 'lucide-react';

const TASK_CATEGORIES: TaskCategory[] = ['Administrasi', 'Vendor', 'Pakaian', 'Dekorasi', 'Undangan', 'Lainnya'];
const TASK_ASSIGNEES: TaskAssignee[] = ['Pria', 'Wanita', 'Bersama'];

const categoryBadge = (category: TaskCategory) => {
  switch (category) {
    case 'Administrasi':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Vendor':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Pakaian':
      return 'bg-pink-50 text-pink-700 border-pink-200';
    case 'Dekorasi':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Undangan':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const assigneeBadge = (assignee: TaskAssignee) => {
  if (assignee === 'Pria') {
    return 'bg-blue-100 text-blue-700 border-blue-200';
  }
  if (assignee === 'Wanita') {
    return 'bg-pink-100 text-pink-700 border-pink-200';
  }
  return 'bg-purple-100 text-purple-700 border-purple-200';
};

const assigneeIcon = (assignee: TaskAssignee) => {
  if (assignee === 'Pria' || assignee === 'Wanita') {
    return <User size={12} />;
  }
  return <Users size={12} />;
};

export default function TimelineManager() {
  const { settings, tasks: rawTasks, addTask, toggleTask, deleteTask } = useWeddingStore();
  const { addToast } = useToastStore();

  // Safe data access dengan fallback
  const tasks = Array.isArray(rawTasks) ? rawTasks : [];

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Administrasi');
  const [monthsBefore, setMonthsBefore] = useState('3');
  const [assignee, setAssignee] = useState<TaskAssignee>('Bersama');

  // Calculate current month
  const currentMonth = settings?.weddingDate ? calculateRemainingMonths(settings.weddingDate) : null;

  // Calculate progress dengan safe access
  const completedTasks = tasks.filter(t => t?.isCompleted).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate assignee statistics dengan fallback untuk assignee
  const assigneeStats = useMemo(() => {
    const stats = {
      Pria: { total: 0, completed: 0 },
      Wanita: { total: 0, completed: 0 },
      Bersama: { total: 0, completed: 0 },
    };

    tasks.forEach(task => {
      // Fallback assignee ke 'Bersama' jika undefined
      const taskAssignee = task?.assignee || 'Bersama';
      
      // Validasi assignee ada di stats
      if (stats[taskAssignee]) {
        stats[taskAssignee].total++;
        if (task?.isCompleted) {
          stats[taskAssignee].completed++;
        }
      }
    });

    return stats;
  }, [tasks]);

  // Group tasks by monthsBefore dengan safe access
  const groupedTasks = useMemo(() => {
    const groups: Record<number, Task[]> = {};
    
    tasks.forEach(task => {
      // Fallback monthsBefore ke 0 jika undefined
      const months = task?.monthsBefore ?? 0;
      
      if (!groups[months]) {
        groups[months] = [];
      }
      groups[months].push(task);
    });

    // Sort by monthsBefore descending
    return Object.entries(groups)
      .map(([month, tasks]) => ({
        month: parseInt(month),
        tasks: tasks.sort((a, b) => {
          if ((a?.isCompleted || false) === (b?.isCompleted || false)) return 0;
          return a?.isCompleted ? 1 : -1;
        }),
      }))
      .sort((a, b) => b.month - a.month);
  }, [tasks]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Administrasi');
    setMonthsBefore('3');
    setAssignee('Bersama');
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast('Judul tugas wajib diisi', 'error');
      return;
    }

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      monthsBefore: parseInt(monthsBefore),
      isDefault: false,
      assignee,
    });

    addToast('Tugas berhasil ditambahkan', 'success');
    resetForm();
  };

  const handleToggle = (id: string) => {
    toggleTask(id);
  };

  const handleDelete = (id: string, taskTitle: string) => {
    if (window.confirm(`Hapus tugas "${taskTitle}"?`)) {
      deleteTask(id);
      addToast('Tugas berhasil dihapus', 'success');
    }
  };

  const getMonthLabel = (months: number) => {
    if (months === 0) return 'Hari H (1 Minggu Sebelum)';
    if (months === 1) return '1 Bulan Sebelum';
    return `${months} Bulan Sebelum`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800">Timeline & Checklist</h2>
        <p className="text-sm text-gray-500 mt-1">Kelola tugas-tugas pernikahan Anda</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-6 border border-[#E8E0D4]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-[#87A878]" />
            <span className="font-semibold text-gray-800">Progress</span>
          </div>
          <span className="text-sm text-gray-600">
            {completedTasks} dari {totalTasks} tugas selesai
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#87A878] to-[#A8C49A] transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-right text-sm font-semibold text-[#87A878] mt-2">
          {progressPercentage.toFixed(0)}%
        </p>
      </div>

      {/* Assignee Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['Pria', 'Wanita', 'Bersama'] as const).map((assigneeType) => {
          const stats = assigneeStats[assigneeType];
          const percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
          
          return (
            <div key={assigneeType} className="bg-white rounded-xl p-4 border border-[#E8E0D4]">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  assigneeType === 'Pria' ? 'bg-blue-100' :
                  assigneeType === 'Wanita' ? 'bg-pink-100' : 'bg-purple-100'
                }`}>
                  {assigneeType === 'Bersama' ? (
                    <Users size={16} className="text-purple-600" />
                  ) : (
                    <User size={16} className={
                      assigneeType === 'Pria' ? 'text-blue-600' : 'text-pink-600'
                    } />
                  )}
                </div>
                <span className={`text-sm font-semibold ${
                  assigneeType === 'Pria' ? 'text-blue-700' :
                  assigneeType === 'Wanita' ? 'text-pink-700' : 'text-purple-700'
                }`}>
                  {assigneeType}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {stats.completed}<span className="text-sm font-normal text-gray-500">/{stats.total}</span>
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    assigneeType === 'Pria' ? 'bg-blue-500' :
                    assigneeType === 'Wanita' ? 'bg-pink-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}% selesai</p>
            </div>
          );
        })}
      </div>

      {/* Current Month Indicator */}
      {currentMonth !== null && (
        <div className="bg-gradient-to-r from-[#B76E79]/10 to-[#87A878]/10 rounded-xl p-4 border border-[#B76E79]/20">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#B76E79]" />
            <span className="text-sm font-medium text-gray-700">
              Saat ini: <strong>{getMonthLabel(currentMonth)}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Timeline Groups */}
      {groupedTasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E0D4]">
          <div className="w-16 h-16 bg-[#F5F0E8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Belum ada tugas</p>
          <p className="text-sm text-gray-400 mt-1">Mulai tambahkan tugas untuk pernikahan Anda</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedTasks.map(({ month, tasks: monthTasks }) => {
            const isCurrentMonth = currentMonth !== null && month === currentMonth;
            const completedInMonth = monthTasks.filter(t => t.isCompleted).length;
            
            return (
              <div key={month} className="bg-white rounded-xl border border-[#E8E0D4] overflow-hidden">
                {/* Month Header */}
                <div className={`px-5 py-3 border-b border-[#E8E0D4] ${isCurrentMonth ? 'bg-gradient-to-r from-[#B76E79]/10 to-[#87A878]/10' : 'bg-[#F5F0E8]/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className={isCurrentMonth ? 'text-[#B76E79]' : 'text-gray-500'} />
                      <h3 className={`font-semibold ${isCurrentMonth ? 'text-[#B76E79]' : 'text-gray-700'}`}>
                        {getMonthLabel(month)}
                      </h3>
                      {isCurrentMonth && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#B76E79] text-white font-medium">
                          SEDANG BERJALAN
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {completedInMonth}/{monthTasks.length} selesai
                    </span>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="divide-y divide-[#F5F0E8]">
                  {monthTasks.map((task) => {
                    // Safe access dengan fallback
                    const taskId = task?.id || '';
                    const taskTitle = task?.title || 'Tugas tanpa judul';
                    const taskDescription = task?.description;
                    const taskCategory = task?.category || 'Lainnya';
                    const taskAssignee = task?.assignee || 'Bersama';
                    const taskIsCompleted = task?.isCompleted || false;
                    const taskIsDefault = task?.isDefault || false;

                    return (
                      <div
                        key={taskId}
                        className={`px-5 py-4 flex items-start gap-3 hover:bg-[#FDFBF7] transition-colors ${
                          taskIsCompleted ? 'opacity-60' : ''
                        }`}
                      >
                        {/* Custom Checkbox */}
                        <button
                          onClick={() => handleToggle(taskId)}
                          className="flex-shrink-0 mt-0.5"
                        >
                          {taskIsCompleted ? (
                            <CheckCircle2 size={22} className="text-[#87A878] transition-all" />
                          ) : (
                            <Circle size={22} className="text-gray-300 hover:text-[#87A878] transition-all" />
                          )}
                        </button>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className={`font-medium ${taskIsCompleted ? 'line-through text-gray-500' : 'text-gray-800'} transition-all`}>
                                {taskTitle}
                              </p>
                              {taskDescription && (
                                <p className="text-sm text-gray-500 mt-1">{taskDescription}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${categoryBadge(taskCategory)}`}>
                                  {taskCategory}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${assigneeBadge(taskAssignee)}`}>
                                  {assigneeIcon(taskAssignee)}
                                  {taskAssignee}
                                </span>
                              </div>
                            </div>

                            {/* Delete Button (only for custom tasks) */}
                            {!taskIsDefault && (
                              <button
                                onClick={() => handleDelete(taskId, taskTitle)}
                                className="flex-shrink-0 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus tugas"
                              >
                                <Trash2 size={16} className="text-red-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#B76E79] to-[#9A5560] text-white rounded-xl hover:shadow-lg hover:shadow-[#B76E79]/20 transition-all text-sm font-medium"
        >
          <Plus size={16} />
          Tambah Tugas Custom
        </button>
      )}

      {/* Inline Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm space-y-5 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading text-lg font-semibold text-gray-800">
              ✨ Tambah Tugas Baru
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-2 hover:bg-[#F5F0E8] rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Judul Tugas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Booking fotografer"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bulan Sebelum Pernikahan</label>
              <select
                value={monthsBefore}
                onChange={(e) => setMonthsBefore(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              >
                <option value="12">12 Bulan</option>
                <option value="9">9 Bulan</option>
                <option value="6">6 Bulan</option>
                <option value="3">3 Bulan</option>
                <option value="1">1 Bulan</option>
                <option value="0">Hari H (0 Bulan)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ditugaskan Kepada</label>
              <div className="flex gap-2">
                {TASK_ASSIGNEES.map((assigneeType) => (
                  <button
                    key={assigneeType}
                    type="button"
                    onClick={() => setAssignee(assigneeType)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      assignee === assigneeType
                        ? assigneeBadge(assigneeType) + ' border-current'
                        : 'border-[#E8E0D4] bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {assigneeIcon(assigneeType)}
                    {assigneeType}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi (opsional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi tugas..."
                rows={2}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 px-5 py-2.5 bg-[#F5F0E8] text-gray-600 rounded-xl hover:bg-[#E8E0D4] transition-colors text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
            >
              Tambah Tugas
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

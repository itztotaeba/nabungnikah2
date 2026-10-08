import { useState } from 'react';
import { useWeddingStore } from '../store';
import { Task } from '../types';
import { Plus, Trash2, CheckCircle2, Circle, X } from 'lucide-react';

const TASK_CATEGORIES: Task['category'][] = ['Administrasi', 'Vendor', 'Pakaian', 'Dekorasi', 'Undangan', 'Lainnya'];
const TASK_ASSIGNEES: Task['assignee'][] = ['Pria', 'Wanita', 'Bersama'];

export default function TimelineManager() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useWeddingStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Task['category']>('Administrasi');
  const [monthsBefore, setMonthsBefore] = useState('3');
  const [assignee, setAssignee] = useState<Task['assignee']>('Bersama');

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
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      monthsBefore: parseInt(monthsBefore),
      isCompleted: false,
      isDefault: false,
      assignee,
    });
    resetForm();
  };

  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.monthsBefore]) acc[task.monthsBefore] = [];
    acc[task.monthsBefore].push(task);
    return acc;
  }, {} as Record<number, Task[]>);

  const getMonthLabel = (months: number) => {
    if (months === 0) return 'Hari H';
    if (months === 1) return '1 Bulan Sebelum';
    return `${months} Bulan Sebelum`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Timeline & Checklist</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola tugas-tugas pernikahan</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
          >
            <Plus size={16} />
            Tambah Tugas
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-500" />
            <span className="font-semibold text-gray-800">Progress</span>
          </div>
          <span className="text-sm text-gray-600">{completedTasks} dari {totalTasks} tugas selesai</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-right text-sm font-semibold text-green-600 mt-2">{progressPercentage.toFixed(0)}%</p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">✨ Tambah Tugas Baru</h3>
            <button type="button" onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Judul Tugas *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Booking fotografer"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Task['category'])}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bulan Sebelum Pernikahan</label>
              <select
                value={monthsBefore}
                onChange={(e) => setMonthsBefore(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
              >
                <option value="12">12 Bulan</option>
                <option value="9">9 Bulan</option>
                <option value="6">6 Bulan</option>
                <option value="3">3 Bulan</option>
                <option value="1">1 Bulan</option>
                <option value="0">Hari H</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ditugaskan Kepada</label>
              <div className="flex gap-2">
                {TASK_ASSIGNEES.map((assigneeType) => (
                  <button
                    key={assigneeType}
                    type="button"
                    onClick={() => setAssignee(assigneeType)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      assignee === assigneeType
                        ? assigneeType === 'Pria'
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : assigneeType === 'Wanita'
                          ? 'bg-pink-100 text-pink-700 border-pink-300'
                          : 'bg-purple-100 text-purple-700 border-purple-300'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {assigneeType}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi (opsional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi tugas..."
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={resetForm} className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-medium">
              Batal
            </button>
            <button type="submit" className="flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg text-sm font-medium">
              Tambah Tugas
            </button>
          </div>
        </form>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500 font-medium">Belum ada tugas</p>
          <p className="text-sm text-gray-400 mt-1">Mulai tambahkan tugas untuk pernikahan Anda</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .map(([month, monthTasks]) => (
              <div key={month} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-700">{getMonthLabel(parseInt(month))}</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {monthTasks.map((task) => (
                    <div key={task.id} className={`px-5 py-4 flex items-start gap-3 ${task.isCompleted ? 'opacity-60' : ''}`}>
                      <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 mt-0.5">
                        {task.isCompleted ? (
                          <CheckCircle2 size={22} className="text-green-500" />
                        ) : (
                          <Circle size={22} className="text-gray-300 hover:text-green-500" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                            {task.category}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                            task.assignee === 'Pria' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            task.assignee === 'Wanita' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                            'bg-purple-100 text-purple-700 border-purple-200'
                          }`}>
                            {task.assignee}
                          </span>
                        </div>
                      </div>
                      {!task.isDefault && (
                        <button onClick={() => deleteTask(task.id)} className="flex-shrink-0 p-2 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

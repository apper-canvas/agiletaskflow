import { useState, useMemo, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'
import { useSelector } from 'react-redux'
import { AuthContext } from '../App'
import ApperIcon from './ApperIcon'
import TaskService from '../services/TaskService'
import CategoryService from '../services/CategoryService'

const MainFeature = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('dueDate')
  const [loading, setLoading] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    priority: 'medium',
    categoryId: 'development',
    tags: []
  })

  const { user, isAuthenticated } = useSelector((state) => state.user)
  const { logout } = useContext(AuthContext)

  // Load initial data
  useEffect(() => {
    loadTasks()
    loadCategories()
  }, [])

  const loadTasks = async () => {
    setTasksLoading(true)
    try {
      const fetchedTasks = await TaskService.fetchTasks()
      // Transform backend data to match UI expectations
      const transformedTasks = fetchedTasks.map(task => ({
        id: task.Id,
        title: task.title || task.Name || '',
        description: task.description || '',
        completed: task.completed ? task.completed.includes('completed') : false,
        createdAt: task.CreatedOn ? new Date(task.CreatedOn) : new Date(),
        dueDate: task.due_date ? new Date(task.due_date) : new Date(),
        priority: task.priority || 'medium',
        categoryId: task.category || 'development',
        tags: task.Tags ? (typeof task.Tags === 'string' ? task.Tags.split(',').filter(Boolean) : []) : []
      }))
      setTasks(transformedTasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setTasksLoading(false)
    }
  }

  const loadCategories = async () => {
    setCategoriesLoading(true)
    try {
      const fetchedCategories = await CategoryService.fetchCategories()
      // Transform backend data to match UI expectations
      const transformedCategories = fetchedCategories.map(category => ({
        id: category.Id || category.id,
        name: category.Name || category.name || '',
        color: category.color || 'bg-blue-500',
        taskCount: 0
      }))
      setCategories(transformedCategories)
    } catch (error) {
      console.error('Failed to load categories:', error)
      // Use default categories if loading fails
      setCategories([
        { id: 'all', name: 'All Tasks', color: 'bg-surface-500', taskCount: 0 },
        { id: 'design', name: 'Design', color: 'bg-purple-500', taskCount: 0 },
        { id: 'development', name: 'Development', color: 'bg-blue-500', taskCount: 0 },
        { id: 'management', name: 'Management', color: 'bg-green-500', taskCount: 0 },
        { id: 'marketing', name: 'Marketing', color: 'bg-pink-500', taskCount: 0 }
      ])
    } finally {
      setCategoriesLoading(false)
    }
  }

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesCategory = activeCategory === 'all' || task.categoryId === activeCategory
      const matchesSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate)
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'completed':
          return a.completed - b.completed
        default:
          return 0
      }
    })
  }, [tasks, activeCategory, searchQuery, sortBy])

  const taskStats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(task => task.completed).length
    const pending = total - completed
    const overdue = tasks.filter(task => !task.completed && new Date(task.dueDate) < new Date()).length
    
    return { total, completed, pending, overdue }
  }, [tasks])

  const formatDueDate = (date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM d, yyyy')
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-surface-500'
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Task title is required')
      return
    }

    setLoading(true)
    try {
      const taskData = {
        title: newTask.title,
        Name: newTask.title, // Map to Name field as well
        description: newTask.description,
        due_date: newTask.dueDate,
        priority: newTask.priority,
        category: newTask.categoryId,
        Tags: newTask.tags.join(','),
        completed: false
      }

      const createdTask = await TaskService.createTask(taskData)
      
      if (createdTask) {
        await loadTasks() // Reload tasks to get updated data
        setNewTask({
          title: '',
          description: '',
          dueDate: format(new Date(), 'yyyy-MM-dd'),
          priority: 'medium',
          categoryId: 'development',
          tags: []
        })
        setShowTaskForm(false)
      }
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Task title is required')
      return
    }

    if (!editingTask) {
      toast.error('No task selected for editing')
      return
    }

    setLoading(true)
    try {
      const taskData = {
        title: newTask.title,
        Name: newTask.title, // Map to Name field as well
        description: newTask.description,
        due_date: newTask.dueDate,
        priority: newTask.priority,
        category: newTask.categoryId,
        Tags: newTask.tags.join(','),
        completed: editingTask.completed
      }

      const updatedTask = await TaskService.updateTask(editingTask.id, taskData)
      
      if (updatedTask) {
        await loadTasks() // Reload tasks to get updated data
        setEditingTask(null)
        setShowTaskForm(false)
        setNewTask({
          title: '',
          description: '',
          dueDate: format(new Date(), 'yyyy-MM-dd'),
          priority: 'medium',
          categoryId: 'development',
          tags: []
        })
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    setLoading(true)
    try {
      const taskData = {
        title: task.title,
        Name: task.title,
        description: task.description,
        due_date: format(task.dueDate, 'yyyy-MM-dd'),
        priority: task.priority,
        category: task.categoryId,
        Tags: task.tags.join(','),
        completed: !task.completed
      }

      const updatedTask = await TaskService.updateTask(taskId, taskData)
      
      if (updatedTask) {
        await loadTasks() // Reload tasks to get updated data
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    setLoading(true)
    try {
      const success = await TaskService.deleteTask(taskId)
      
      if (success) {
        await loadTasks() // Reload tasks to get updated data
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setNewTask({
      title: task.title,
      description: task.description,
      dueDate: format(task.dueDate, 'yyyy-MM-dd'),
      priority: task.priority,
      categoryId: task.categoryId,
      tags: task.tags
    })
    setShowTaskForm(true)
  }

  const addTag = (tag) => {
    if (tag.trim() && !newTask.tags.includes(tag.trim())) {
      setNewTask(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }))
    }
  }

  const removeTag = (tagToRemove) => {
    setNewTask(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Show loading state while data is being fetched
  if (tasksLoading || categoriesLoading) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-surface-600 dark:text-surface-300">Loading tasks...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
      <div className="max-w-7xl mx-auto">
        {/* User Info and Logout */}
        {isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex justify-between items-center bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-soft"
          >
            <div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                Welcome, {user.firstName || user.name || 'User'}!
              </h2>
              <p className="text-surface-600 dark:text-surface-300 text-sm">
                {user.emailAddress || user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          {[
            { label: 'Total Tasks', value: taskStats.total, icon: 'List', gradient: 'from-blue-500 to-blue-600' },
            { label: 'Completed', value: taskStats.completed, icon: 'CheckCircle', gradient: 'from-green-500 to-green-600' },
            { label: 'Pending', value: taskStats.pending, icon: 'Clock', gradient: 'from-yellow-500 to-yellow-600' },
            { label: 'Overdue', value: taskStats.overdue, icon: 'AlertTriangle', gradient: 'from-red-500 to-red-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="task-card p-4 sm:p-6 text-center"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <ApperIcon name={stat.icon} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm sm:text-base text-surface-600 dark:text-surface-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="task-card p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-soft'
                        : 'bg-surface-50 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-xs">
                      {category.id === 'all' 
                        ? taskStats.total 
                        : tasks.filter(task => task.categoryId === category.id).length
                      }
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingTask(null)
                setShowTaskForm(true)
                setNewTask({
                  title: '',
                  description: '',
                  dueDate: format(new Date(), 'yyyy-MM-dd'),
                  priority: 'medium',
                  categoryId: 'development',
                  tags: []
                })
              }}
              className="w-full gradient-border bg-white dark:bg-surface-800 p-4 rounded-2xl font-medium text-surface-900 dark:text-white hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors flex items-center justify-center space-x-2"
              disabled={loading}
            >
              <ApperIcon name="Plus" className="w-5 h-5" />
              <span>New Task</span>
            </motion.button>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            {/* Search and Sort */}
            <div className="task-card p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors text-surface-900 dark:text-white"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors text-surface-900 dark:text-white"
                >
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="completed">Sort by Status</option>
                </select>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-4">
              <AnimatePresence>
                {filteredAndSortedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`task-card p-4 sm:p-6 ${task.completed ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleToggleComplete(task.id)}
                        disabled={loading}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-accent border-accent text-white'
                            : 'border-surface-300 dark:border-surface-600 hover:border-accent'
                        }`}
                      >
                        {task.completed && <ApperIcon name="Check" className="w-4 h-4" />}
                      </motion.button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <h4 className={`text-lg font-semibold ${
                            task.completed 
                              ? 'line-through text-surface-500 dark:text-surface-400' 
                              : 'text-surface-900 dark:text-white'
                          }`}>
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            <div className="flex items-center gap-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEditTask(task)}
                                disabled={loading}
                                className="p-1 text-surface-400 hover:text-primary-500 transition-colors"
                              >
                                <ApperIcon name="Edit2" className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteTask(task.id)}
                                disabled={loading}
                                className="p-1 text-surface-400 hover:text-red-500 transition-colors"
                              >
                                <ApperIcon name="Trash2" className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className={`text-sm mb-3 ${
                            task.completed 
                              ? 'text-surface-400 dark:text-surface-500' 
                              : 'text-surface-600 dark:text-surface-300'
                          }`}>
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-1 text-surface-500 dark:text-surface-400">
                            <ApperIcon name="Calendar" className="w-4 h-4" />
                            <span>{formatDueDate(task.dueDate)}</span>
                          </div>
                          
                          {task.tags?.length > 0 && (
                            <div className="flex items-center gap-2">
                              {task.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 rounded-lg text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredAndSortedTasks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="task-card p-8 sm:p-12 text-center"
                >
                  <div className="w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ApperIcon name="ClipboardList" className="w-8 h-8 text-surface-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
                    No tasks found
                  </h3>
                  <p className="text-surface-600 dark:text-surface-300">
                    {searchQuery 
                      ? 'Try adjusting your search terms or filters.'
                      : 'Create your first task to get started with TaskFlow.'
                    }
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Task Form Modal */}
        <AnimatePresence>
          {showTaskForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowTaskForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="task-card p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowTaskForm(false)}
                    className="p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                  >
                    <ApperIcon name="X" className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors text-surface-900 dark:text-white"
                      placeholder="Enter task title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors text-surface-900 dark:text-white resize-none"
                      placeholder="Enter task description..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors text-surface-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors text-surface-900 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Category
                      </label>
                      <select
                        value={newTask.categoryId}
                        onChange={(e) => setNewTask(prev => ({ ...prev, categoryId: e.target.value }))}
                        className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors text-surface-900 dark:text-white"
                      >
                        {categories.filter(cat => cat.id !== 'all').map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {newTask.tags.map((tag, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg text-sm"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-primary-500 hover:text-primary-700 dark:hover:text-primary-400"
                          >
                            <ApperIcon name="X" className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Press Enter to add tags..."
                      className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors text-surface-900 dark:text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={editingTask ? handleUpdateTask : handleCreateTask}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-medium shadow-soft hover:shadow-card transition-shadow flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ApperIcon name={editingTask ? "Save" : "Plus"} className="w-5 h-5" />
                      )}
                      <span>{loading ? 'Processing...' : (editingTask ? 'Update Task' : 'Create Task')}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowTaskForm(false)}
                      disabled={loading}
                      className="px-6 py-3 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-xl font-medium hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default MainFeature


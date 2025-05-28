import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'

const Home = () => {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode')
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme))
      if (JSON.parse(savedTheme)) {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode))
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-40 backdrop-blur-md bg-white bg-opacity-80 dark:bg-surface-900 dark:bg-opacity-80 border-b border-surface-200 dark:border-surface-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-soft">
                <ApperIcon name="CheckSquare" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gradient">TaskFlow</h1>
            </motion.div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="neu-button p-2 sm:p-3"
              >
                <ApperIcon 
                  name={darkMode ? "Sun" : "Moon"} 
                  className="w-4 h-4 sm:w-5 sm:h-5 text-surface-600 dark:text-surface-300" 
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-xl font-medium shadow-soft hover:shadow-card transition-shadow"
              >
                <ApperIcon name="Zap" className="w-4 h-4" />
                <span>Boost Productivity</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-8 sm:pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6 sm:mb-8"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-surface-900 dark:text-white mb-4 sm:mb-6">
                  Master Your
                  <span className="text-gradient block sm:inline sm:ml-3">
                    Productivity
                  </span>
                </h2>
                <p className="text-lg sm:text-xl text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
                  Transform chaos into clarity with TaskFlow's intelligent task management system
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 sm:mb-12"
              >
                <div className="glass-card px-4 sm:px-6 py-3 sm:py-4 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-sm sm:text-base font-medium text-surface-700 dark:text-surface-200">
                      Smart Organization
                    </span>
                  </div>
                </div>
                <div className="glass-card px-4 sm:px-6 py-3 sm:py-4 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                    <span className="text-sm sm:text-base font-medium text-surface-700 dark:text-surface-200">
                      Real-time Sync
                    </span>
                  </div>
                </div>
                <div className="glass-card px-4 sm:px-6 py-3 sm:py-4 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-secondary-500 rounded-full animate-pulse"></div>
                    <span className="text-sm sm:text-base font-medium text-surface-700 dark:text-surface-200">
                      Analytics Driven
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Feature */}
        <MainFeature />

        {/* Features Grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-surface-900 dark:text-white mb-4">
                Everything You Need to
                <span className="text-gradient-green block sm:inline sm:ml-2">
                  Stay Organized
                </span>
              </h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  icon: "Target",
                  title: "Smart Prioritization",
                  description: "AI-powered task prioritization based on deadlines, importance, and your productivity patterns.",
                  gradient: "from-primary-500 to-primary-600"
                },
                {
                  icon: "Calendar",
                  title: "Timeline Management",
                  description: "Visual timeline view with drag-and-drop scheduling and automatic conflict detection.",
                  gradient: "from-secondary-500 to-secondary-600"
                },
                {
                  icon: "BarChart3",
                  title: "Progress Analytics",
                  description: "Detailed insights into your productivity trends and goal achievement patterns.",
                  gradient: "from-accent to-green-600"
                },
                {
                  icon: "Users",
                  title: "Team Collaboration",
                  description: "Share projects, assign tasks, and collaborate seamlessly with your team members.",
                  gradient: "from-purple-500 to-purple-600"
                },
                {
                  icon: "Smartphone",
                  title: "Cross-Platform Sync",
                  description: "Access your tasks anywhere with real-time synchronization across all devices.",
                  gradient: "from-blue-500 to-blue-600"
                },
                {
                  icon: "Zap",
                  title: "Quick Actions",
                  description: "Keyboard shortcuts, voice commands, and smart templates for lightning-fast task creation.",
                  gradient: "from-orange-500 to-orange-600"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="task-card p-6 lg:p-8 group cursor-pointer"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <ApperIcon name={feature.icon} className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-surface-900 dark:text-white mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-900 dark:bg-surface-950 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <ApperIcon name="CheckSquare" className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">TaskFlow</span>
            </div>
            <p className="text-surface-400 text-sm sm:text-base text-center sm:text-right">
              © 2024 TaskFlow. Streamline your productivity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
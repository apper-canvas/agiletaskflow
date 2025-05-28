import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="task-card p-8 sm:p-12"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <ApperIcon name="Search" className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </motion.div>
          
          <h1 className="text-6xl sm:text-7xl font-bold text-gradient mb-4">404</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-surface-900 dark:text-white mb-4">
            Task Not Found
          </h2>
          <p className="text-surface-600 dark:text-surface-300 mb-8">
            Looks like this page has been completed and archived. Let's get you back to your active tasks.
          </p>
          
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-medium shadow-soft hover:shadow-card transition-shadow flex items-center space-x-2 mx-auto"
            >
              <ApperIcon name="Home" className="w-4 h-4" />
              <span>Return to TaskFlow</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound
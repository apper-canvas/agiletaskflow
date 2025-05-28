import { toast } from 'react-toastify'

class TaskService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'task29'
  }

  async fetchTasks(params = {}) {
    try {
      // All fields from the task29 table - including both updateable and system fields for display
      const allFields = [
        'Id', 'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
        'title', 'description', 'completed', 'due_date', 'priority', 'category'
      ]

      const queryParams = {
        fields: allFields,
        ...params
      }

      const response = await this.apperClient.fetchRecords(this.tableName, queryParams)
      
      if (!response || !response.data) {
        return []
      }

      return response.data
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
      return []
    }
  }

  async getTaskById(taskId) {
    try {
      const allFields = [
        'Id', 'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
        'title', 'description', 'completed', 'due_date', 'priority', 'category'
      ]

      const params = {
        fields: allFields
      }

      const response = await this.apperClient.getRecordById(this.tableName, taskId, params)
      
      if (!response || !response.data) {
        return null
      }

      return response.data
    } catch (error) {
      console.error(`Error fetching task with ID ${taskId}:`, error)
      toast.error('Failed to load task')
      return null
    }
  }

  async createTask(taskData) {
    try {
      // Only include updateable fields for creation
      const updateableFields = {
        Name: taskData.Name || taskData.title || '',
        Tags: Array.isArray(taskData.Tags) ? taskData.Tags.join(',') : (taskData.Tags || ''),
        title: taskData.title || '',
        description: taskData.description || '',
        completed: Array.isArray(taskData.completed) ? taskData.completed.join(',') : (taskData.completed ? 'completed' : ''),
        due_date: taskData.due_date || taskData.dueDate || '',
        priority: taskData.priority || 'medium'
      }

      // Only include category if it's provided
      if (taskData.category) {
        updateableFields.category = taskData.category
      }

      const params = {
        records: [updateableFields]
      }

      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        
        if (successfulRecords.length > 0) {
          toast.success('Task created successfully!')
          return successfulRecords[0].data
        } else {
          const failedRecord = response.results[0]
          if (failedRecord.errors) {
            failedRecord.errors.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
          } else {
            toast.error('Failed to create task')
          }
          return null
        }
      } else {
        toast.error('Failed to create task')
        return null
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
      return null
    }
  }

  async updateTask(taskId, taskData) {
    try {
      // Only include updateable fields for update
      const updateableFields = {
        Id: taskId,
        Name: taskData.Name || taskData.title || '',
        Tags: Array.isArray(taskData.Tags) ? taskData.Tags.join(',') : (taskData.Tags || ''),
        title: taskData.title || '',
        description: taskData.description || '',
        completed: Array.isArray(taskData.completed) ? taskData.completed.join(',') : (taskData.completed ? 'completed' : ''),
        due_date: taskData.due_date || taskData.dueDate || '',
        priority: taskData.priority || 'medium'
      }

      // Only include category if it's provided
      if (taskData.category) {
        updateableFields.category = taskData.category
      }

      const params = {
        records: [updateableFields]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success('Task updated successfully!')
          return successfulUpdates[0].data
        } else {
          toast.error('Failed to update task')
          return null
        }
      } else {
        toast.error('Failed to update task')
        return null
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
      return null
    }
  }

  async deleteTask(taskId) {
    try {
      const params = {
        RecordIds: [taskId]
      }

      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        
        if (successfulDeletions.length > 0) {
          toast.success('Task deleted successfully!')
          return true
        } else {
          toast.error('Failed to delete task')
          return false
        }
      } else {
        toast.error('Failed to delete task')
        return false
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
      return false
    }
  }

  async searchTasks(searchQuery, categoryFilter = null) {
    try {
      const whereConditions = []
      
      if (searchQuery) {
        whereConditions.push(
          {
            fieldName: 'title',
            operator: 'Contains',
            values: [searchQuery]
          },
          {
            fieldName: 'description',
            operator: 'Contains',
            values: [searchQuery]
          }
        )
      }

      if (categoryFilter && categoryFilter !== 'all') {
        whereConditions.push({
          fieldName: 'category',
          operator: 'ExactMatch',
          values: [categoryFilter]
        })
      }

      const params = {
        where: whereConditions.length > 0 ? whereConditions : undefined,
        whereGroups: searchQuery && whereConditions.length > 1 ? [
          {
            operator: 'OR',
            subGroups: [
              {
                conditions: whereConditions.slice(0, 2),
                operator: ''
              }
            ]
          }
        ] : undefined
      }

      return await this.fetchTasks(params)
    } catch (error) {
      console.error('Error searching tasks:', error)
      toast.error('Failed to search tasks')
      return []
    }
  }
}

export default new TaskService()

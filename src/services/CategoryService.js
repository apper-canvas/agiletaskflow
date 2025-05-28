import { toast } from 'react-toastify'

class CategoryService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'category1'
  }

  async fetchCategories(params = {}) {
    try {
      // All fields from the category1 table
      const allFields = [
        'Id', 'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'color'
      ]

      const queryParams = {
        fields: allFields,
        ...params
      }

      const response = await this.apperClient.fetchRecords(this.tableName, queryParams)
      
      if (!response || !response.data) {
        return this.getDefaultCategories()
      }

      // Add the "All Tasks" category to the beginning of the list
      const categories = [{ id: 'all', Name: 'All Tasks', color: 'bg-surface-500' }, ...response.data]
      return categories
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories, using defaults')
      return this.getDefaultCategories()
    }
  }

  getDefaultCategories() {
    return [
      { id: 'all', Name: 'All Tasks', color: 'bg-surface-500' },
      { id: 'design', Name: 'Design', color: 'bg-purple-500' },
      { id: 'development', Name: 'Development', color: 'bg-blue-500' },
      { id: 'management', Name: 'Management', color: 'bg-green-500' },
      { id: 'marketing', Name: 'Marketing', color: 'bg-pink-500' }
    ]
  }

  async getCategoryById(categoryId) {
    try {
      const allFields = [
        'Id', 'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'color'
      ]

      const params = {
        fields: allFields
      }

      const response = await this.apperClient.getRecordById(this.tableName, categoryId, params)
      
      if (!response || !response.data) {
        return null
      }

      return response.data
    } catch (error) {
      console.error(`Error fetching category with ID ${categoryId}:`, error)
      toast.error('Failed to load category')
      return null
    }
  }

  async createCategory(categoryData) {
    try {
      // Only include updateable fields for creation
      const updateableFields = {
        Name: categoryData.Name || categoryData.name || '',
        Tags: Array.isArray(categoryData.Tags) ? categoryData.Tags.join(',') : (categoryData.Tags || ''),
        color: categoryData.color || 'bg-blue-500'
      }

      const params = {
        records: [updateableFields]
      }

      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        
        if (successfulRecords.length > 0) {
          toast.success('Category created successfully!')
          return successfulRecords[0].data
        } else {
          const failedRecord = response.results[0]
          if (failedRecord.errors) {
            failedRecord.errors.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
          } else {
            toast.error('Failed to create category')
          }
          return null
        }
      } else {
        toast.error('Failed to create category')
        return null
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
      return null
    }
  }

  async updateCategory(categoryId, categoryData) {
    try {
      // Only include updateable fields for update
      const updateableFields = {
        Id: categoryId,
        Name: categoryData.Name || categoryData.name || '',
        Tags: Array.isArray(categoryData.Tags) ? categoryData.Tags.join(',') : (categoryData.Tags || ''),
        color: categoryData.color || 'bg-blue-500'
      }

      const params = {
        records: [updateableFields]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success('Category updated successfully!')
          return successfulUpdates[0].data
        } else {
          toast.error('Failed to update category')
          return null
        }
      } else {
        toast.error('Failed to update category')
        return null
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
      return null
    }
  }

  async deleteCategory(categoryId) {
    try {
      const params = {
        RecordIds: [categoryId]
      }

      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        
        if (successfulDeletions.length > 0) {
          toast.success('Category deleted successfully!')
          return true
        } else {
          toast.error('Failed to delete category')
          return false
        }
      } else {
        toast.error('Failed to delete category')
        return false
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
      return false
    }
  }
}

export default new CategoryService()

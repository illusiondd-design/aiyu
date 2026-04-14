// services/queueService.ts
// PostMeister - Queue Service with Supabase API Integration
// Updated: 2026-04-09

export interface QueueItem {
  id: string
  account_id?: string
  brand_id?: string
  company_id: string
  company_name: string
  text_content: string
  platform: string
  image_url?: string
  video_url?: string
  ai_provider?: string
  prompt_used?: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduled_for?: string
  published_at?: string
  external_post_id?: string
  engagement_data?: any
  tags?: string[]
  metadata?: any
  created_at: string
  updated_at: string
}

class QueueService {
  private baseUrl = '/api/posts'

  /**
   * Get all posts (with optional filters)
   */
  async getPosts(filters?: {
    account_id?: string
    brand_id?: string
    company_id?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<QueueItem[]> {
    try {
      const params = new URLSearchParams()

      if (filters?.account_id) params.append('account_id', filters.account_id)
      if (filters?.brand_id) params.append('brand_id', filters.brand_id)
      if (filters?.company_id) params.append('company_id', filters.company_id)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`)
      }

      const data = await response.json()
      return data.posts || []
    } catch (error) {
      console.error('Error fetching posts:', error)
      return []
    }
  }

  /**
   * Get posts by company
   */
  async getPostsByCompany(companyId: string, limit = 50): Promise<QueueItem[]> {
    return this.getPosts({ company_id: companyId, limit })
  }

  /**
   * Get posts by brand
   */
  async getPostsByBrand(brandId: string, limit = 50): Promise<QueueItem[]> {
    return this.getPosts({ brand_id: brandId, limit })
  }

  /**
   * Get posts by status
   */
  async getPostsByStatus(
    status: string,
    companyId?: string,
    accountId?: string,
    brandId?: string
  ): Promise<QueueItem[]> {
    return this.getPosts({
      status,
      company_id: companyId,
      account_id: accountId,
      brand_id: brandId
    })
  }

  /**
   * Add new post to queue
   */
  async addPost(post: Omit<QueueItem, 'id' | 'created_at' | 'updated_at'>): Promise<QueueItem | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create post')
      }

      const data = await response.json()

      if (data.success) {
        console.log('✅ Post added to queue:', data.post.id)

        // Trigger queue update event
        this.triggerQueueUpdate()

        return data.post
      }

      return null
    } catch (error) {
      console.error('Error adding post:', error)
      throw error
    }
  }

  /**
   * Update post (status, schedule, etc.)
   */
  async updatePost(id: string, updates: Partial<QueueItem>): Promise<QueueItem | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update post')
      }

      const data = await response.json()

      if (data.success) {
        console.log('✅ Post updated:', id)

        // Trigger queue update event
        this.triggerQueueUpdate()

        return data.post
      }

      return null
    } catch (error) {
      console.error('Error updating post:', error)
      throw error
    }
  }

  /**
   * Delete post
   */
  async deletePost(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete post')
      }

      const data = await response.json()

      if (data.success) {
        console.log('✅ Post deleted:', id)

        // Trigger queue update event
        this.triggerQueueUpdate()

        return true
      }

      return false
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  /**
   * Update post status
   */
  async updateStatus(
    id: string,
    status: 'draft' | 'scheduled' | 'published' | 'failed',
    additionalData?: {
      published_at?: string
      external_post_id?: string
      scheduled_for?: string
    }
  ): Promise<QueueItem | null> {
    return this.updatePost(id, {
      status,
      ...additionalData
    })
  }

  /**
   * Trigger queue update event (for real-time UI updates)
   */
  private triggerQueueUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('postmeister:queue-updated'))
    }
  }

  /**
   * Listen for queue updates
   */
  onQueueUpdate(callback: () => void): () => void {
    if (typeof window === 'undefined') {
      return () => {}
    }

    const handler = () => callback()
    window.addEventListener('postmeister:queue-updated', handler)

    return () => {
      window.removeEventListener('postmeister:queue-updated', handler)
    }
  }

  /**
   * Clear all posts (DANGER - use with caution)
   */
  async clearAll(): Promise<boolean> {
    console.warn('⚠️ clearAll() is not implemented for safety reasons')
    console.warn('Use DELETE endpoint with specific IDs instead')
    return false
  }
}

// Export singleton instance
export const queueService = new QueueService()

// Export class for testing
export default QueueService

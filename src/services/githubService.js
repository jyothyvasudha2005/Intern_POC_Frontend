/**
 * GitHub Service
 * Handles fetching GitHub data (commits, README, etc.)
 */

import apiClient from './apiClient'
import { API_ENDPOINTS } from './apiConfig'

/**
 * Fetch commits for a repository
 * @param {string} repoName - The name of the repository
 * @param {string} since - ISO date string for filtering commits (default: 2024-01-01)
 * @returns {Promise<Array>} - Array of commits
 */
export const fetchCommits = async (repoName, since = '2024-01-01T00:00:00Z') => {
  try {
    console.log(`📝 GitHub: Fetching commits for repo: ${repoName} (since: ${since})`)
    
    const endpoint = API_ENDPOINTS.GITHUB_COMMITS(repoName, since)
    const response = await apiClient.get(endpoint)

    console.log(`✅ GitHub: Response for ${repoName}:`, response.data)

    // Handle different response formats
    if (Array.isArray(response.data)) {
      // Direct array response
      console.log(`✅ GitHub: Fetched ${response.data.length} commits for ${repoName}`)
      return response.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      // Wrapped in data object
      console.log(`✅ GitHub: Fetched ${response.data.data.length} commits for ${repoName}`)
      return response.data.data
    } else if (response.data?.commits && Array.isArray(response.data.commits)) {
      // Wrapped in commits object
      console.log(`✅ GitHub: Fetched ${response.data.commits.length} commits for ${repoName}`)
      return response.data.commits
    }

    console.warn(`⚠️ GitHub: Unexpected response format for ${repoName}`)
    return []
  } catch (error) {
    // Handle errors gracefully - don't throw
    if (error.response?.status === 404) {
      console.log(`ℹ️ GitHub: No commits found for ${repoName} (404)`)
    } else if (error.response?.status === 500) {
      console.log(`ℹ️ GitHub: Server error for ${repoName} (500)`)
    } else {
      console.log(`ℹ️ GitHub: Error fetching commits for ${repoName}: ${error.message}`)
    }
    
    return []
  }
}

/**
 * Fetch commits for multiple repositories in parallel
 * @param {Array<string>} repoNames - Array of repository names
 * @param {string} since - ISO date string for filtering commits
 * @returns {Promise<Object>} - Map of repo names to commits arrays
 */
export const fetchCommitsBatch = async (repoNames, since = '2024-01-01T00:00:00Z') => {
  try {
    console.log(`\n📝 GitHub Batch: Fetching commits for ${repoNames.length} repositories...`)

    // Fetch all repos in parallel
    const promises = repoNames.map(repoName =>
      fetchCommits(repoName, since)
        .then(commits => ({ repoName, commits }))
    )

    const results = await Promise.all(promises)

    // Convert array to map for easy lookup
    const commitsMap = {}
    let totalCommits = 0

    results.forEach(result => {
      commitsMap[result.repoName] = result.commits
      totalCommits += result.commits.length
    })

    console.log(`✅ GitHub Batch: Complete - ${totalCommits} total commits from ${repoNames.length} repos\n`)

    return commitsMap
  } catch (error) {
    console.log(`ℹ️ GitHub Batch: Error in batch fetch: ${error.message}`)
    return {}
  }
}

export default {
  fetchCommits,
  fetchCommitsBatch
}


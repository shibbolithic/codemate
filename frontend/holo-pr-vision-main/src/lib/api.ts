/**
 * API Service for PR Review Agent
 * Configurable backend URL for Railway deployment + GitHub API integration
 */

import { API_CONFIG } from '../config/api';

// Configuration
const CONFIG = API_CONFIG;

const GITHUB_API = {
  baseURL: 'https://api.github.com',
  // Popular repositories to fetch real PRs from
  repositories: [
    'microsoft/vscode',
    'facebook/react', 
    'vercel/next.js',
    'microsoft/TypeScript',
    'tailwindlabs/tailwindcss',
    'supabase/supabase',
    'shadcn-ui/ui',
  ],
};

// Types
export interface PullRequest {
  id: string;
  title: string;
  repository: string;
  author: string;
  branch: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  reviewScore?: number;
  url: string;
}

export interface ReviewComment {
  id: string;
  type: 'suggestion' | 'warning' | 'error' | 'info';
  file: string;
  line: number;
  message: string;
  code?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AIReview {
  id: string;
  pullRequestId: string;
  overallScore: number;
  summary: string;
  codeStructure: {
    score: number;
    comments: string[];
  };
  codingStandards: {
    score: number;
    comments: string[];
  };
  possibleBugs: ReviewComment[];
  suggestions: ReviewComment[];
  comments: ReviewComment[];
  generatedAt: string;
}

// API Class
class PRReviewAPI {
  private baseURL: string;

  constructor(baseURL: string = CONFIG.baseURL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Get all pull requests (from Railway API)
  async getPullRequests(): Promise<PullRequest[]> {
    // Try different possible endpoints
    const possibleEndpoints = [
      '/api/pull-requests',
      '/webhook/pull-requests', 
      '/pull-requests',
      '/api/prs',
      '/prs'
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying Railway endpoint: ${this.baseURL}${endpoint}`);
        const data = await this.request<PullRequest[]>(endpoint);
        console.log(`Success with endpoint: ${endpoint}`, data);
        return data;
      } catch (error) {
        console.log(`Failed endpoint ${endpoint}:`, error);
      }
    }

    // If all endpoints fail, try to get data from the webhook endpoint directly
    try {
      console.log('Trying webhook endpoint for PR data...');
      const response = await fetch(`${this.baseURL}/webhook`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Webhook endpoint response:', data);
        
        // Try to extract PR data from response
        if (data.pullRequests) return data.pullRequests;
        if (data.prs) return data.prs;
        if (data.data && data.data.pullRequests) return data.data.pullRequests;
        if (Array.isArray(data)) return data;
      }
    } catch (error) {
      console.log('Webhook endpoint failed:', error);
    }

    throw new Error('No Railway API endpoints available');
  }

  // Fetch real PRs from GitHub API
  private async fetchGitHubPRs(): Promise<PullRequest[]> {
    try {
      const allPRs: PullRequest[] = [];
      
      // Fetch PRs from multiple repositories
      for (const repo of GITHUB_API.repositories.slice(0, 3)) { // Limit to 3 repos to avoid rate limits
        try {
          const response = await fetch(
            `${GITHUB_API.baseURL}/repos/${repo}/pulls?state=all&per_page=5&sort=updated`,
            {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'PR-Review-Agent',
              },
            }
          );
          
          if (response.ok) {
            const githubPRs = await response.json();
            const convertedPRs = githubPRs.map((pr: any) => this.convertGitHubPR(pr, repo));
            allPRs.push(...convertedPRs);
          }
        } catch (repoError) {
          console.warn(`Failed to fetch PRs from ${repo}:`, repoError);
        }
      }
      
      // If we got real PRs, return them, otherwise use mock data
      return allPRs.length > 0 ? allPRs : mockPullRequests;
    } catch (error) {
      console.warn('GitHub API failed, using mock data:', error);
      return mockPullRequests;
    }
  }

  // Convert GitHub PR to our format
  private convertGitHubPR(githubPR: any, repo: string): PullRequest {
    const statuses: Array<'pending' | 'reviewed' | 'approved' | 'rejected'> = ['pending', 'reviewed', 'approved'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomScore = randomStatus === 'reviewed' || randomStatus === 'approved' 
      ? Math.floor(Math.random() * 30) + 70 // 70-100 for reviewed/approved
      : undefined;

    return {
      id: githubPR.id.toString(),
      title: githubPR.title,
      repository: repo.split('/')[1], // Just the repo name
      author: githubPR.user.login,
      branch: githubPR.head.ref,
      status: randomStatus,
      createdAt: githubPR.created_at,
      updatedAt: githubPR.updated_at,
      reviewScore: randomScore,
      url: githubPR.html_url,
    };
  }

  // Get a specific pull request
  async getPullRequest(id: string): Promise<PullRequest> {
    return this.request<PullRequest>(`/api/pull-requests/${id}`);
  }

  // Get AI review for a pull request (from Railway API)
  async getAIReview(pullRequestId: string): Promise<AIReview> {
    // Try different possible endpoints
    const possibleEndpoints = [
      `/api/reviews/${pullRequestId}`,
      `/webhook/reviews/${pullRequestId}`,
      `/reviews/${pullRequestId}`,
      `/api/review/${pullRequestId}`,
      `/review/${pullRequestId}`
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying Railway review endpoint: ${this.baseURL}${endpoint}`);
        const data = await this.request<AIReview>(endpoint);
        console.log(`Success with review endpoint: ${endpoint}`, data);
        return data;
      } catch (error) {
        console.log(`Failed review endpoint ${endpoint}:`, error);
      }
    }

    // Try webhook endpoint with PR ID in payload
    try {
      console.log('Trying webhook endpoint for review data...');
      const response = await fetch(`${this.baseURL}/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'get_review',
          pullRequestId: pullRequestId,
          prId: pullRequestId
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Webhook review response:', data);
        return data;
      }
    } catch (error) {
      console.log('Webhook review endpoint failed:', error);
    }

    throw new Error('No Railway review endpoints available');
  }

  // Generate more realistic AI review based on PR data
  private generateRealisticAIReview(pullRequestId: string): AIReview {
    const scores = {
      overall: Math.floor(Math.random() * 30) + 70, // 70-100
      structure: Math.floor(Math.random() * 25) + 75,
      standards: Math.floor(Math.random() * 25) + 75,
    };

    const templates = {
      summaries: [
        "This pull request implements solid changes with good code organization. The implementation follows best practices, though there are some areas for improvement in error handling and documentation.",
        "Well-structured changes that demonstrate good understanding of the codebase. The code is readable and maintainable, with appropriate separation of concerns.",
        "This PR introduces important improvements with clean, well-organized code. Some minor issues with edge case handling and test coverage could be addressed.",
      ],
      structureComments: [
        "Components are well-organized with clear separation of concerns",
        "Good modular design that promotes reusability",
        "Clean architecture with appropriate abstraction levels",
        "Consider extracting some utility functions for better maintainability",
      ],
      standardsComments: [
        "Consistent coding style and naming conventions",
        "Good TypeScript usage with proper type definitions",
        "Follows established patterns in the codebase",
        "Some functions could benefit from additional documentation",
      ],
    };

    return {
      id: `ai-review-${pullRequestId}`,
      pullRequestId,
      overallScore: scores.overall,
      summary: templates.summaries[Math.floor(Math.random() * templates.summaries.length)],
      codeStructure: {
        score: scores.structure,
        comments: templates.structureComments.slice(0, Math.floor(Math.random() * 2) + 2),
      },
      codingStandards: {
        score: scores.standards,
        comments: templates.standardsComments.slice(0, Math.floor(Math.random() * 2) + 2),
      },
      possibleBugs: this.generateRandomIssues(),
      suggestions: this.generateRandomSuggestions(),
      comments: [],
      generatedAt: new Date().toISOString(),
    };
  }

  private generateRandomIssues(): ReviewComment[] {
    const issues = [
      {
        type: 'error' as const,
        message: 'Potential null pointer exception in data handling',
        severity: 'high' as const,
        file: 'src/components/DataProcessor.tsx',
        line: 42,
      },
      {
        type: 'warning' as const,
        message: 'Missing input validation for user data',
        severity: 'medium' as const,
        file: 'src/utils/validators.ts',
        line: 18,
      },
      {
        type: 'error' as const,
        message: 'Race condition possible in async operations',
        severity: 'high' as const,
        file: 'src/hooks/useAsyncData.ts',
        line: 35,
      },
    ];

    return issues.slice(0, Math.floor(Math.random() * 3)).map((issue, index) => ({
      id: `issue-${index}`,
      ...issue,
    }));
  }

  private generateRandomSuggestions(): ReviewComment[] {
    const suggestions = [
      {
        type: 'suggestion' as const,
        message: 'Consider using React.memo for performance optimization',
        severity: 'low' as const,
        file: 'src/components/ExpensiveComponent.tsx',
        line: 12,
      },
      {
        type: 'suggestion' as const,
        message: 'Extract magic numbers to named constants',
        severity: 'medium' as const,
        file: 'src/utils/calculations.ts',
        line: 24,
      },
    ];

    return suggestions.slice(0, Math.floor(Math.random() * 2) + 1).map((suggestion, index) => ({
      id: `suggestion-${index}`,
      ...suggestion,
    }));
  }

  // Trigger new review (if supported by backend)
  async triggerReview(pullRequestId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/reviews/${pullRequestId}/trigger`, {
      method: 'POST',
    });
  }

  // Health check with multiple endpoint attempts
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const endpoints = ['/health', '/webhook/health', '/api/health', '/webhook'];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying health endpoint: ${this.baseURL}${endpoint}`);
        const result = await this.request<{ status: string; timestamp: string }>(endpoint);
        console.log(`Health check success:`, result);
        return result;
      } catch (error) {
        console.log(`Health endpoint ${endpoint} failed:`, error);
      }
    }
    
    throw new Error('No health endpoints available');
  }
}

// Export singleton instance
export const prReviewAPI = new PRReviewAPI();

// Mock data for development/demo purposes
export const mockPullRequests: PullRequest[] = [
  {
    id: '1',
    title: 'Add user authentication system',
    repository: 'frontend-app',
    author: 'johndoe',
    branch: 'feature/auth-system',
    status: 'reviewed',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    reviewScore: 85,
    url: 'https://github.com/company/frontend-app/pull/42',
  },
  {
    id: '2',
    title: 'Optimize database queries in user service',
    repository: 'backend-api',
    author: 'janesmith',
    branch: 'optimize/user-queries',
    status: 'pending',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    url: 'https://github.com/company/backend-api/pull/128',
  },
  {
    id: '3',
    title: 'Fix memory leak in websocket connections',
    repository: 'realtime-service',
    author: 'mikewilson',
    branch: 'bugfix/websocket-memory-leak',
    status: 'approved',
    createdAt: '2024-01-14T16:45:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
    reviewScore: 92,
    url: 'https://github.com/company/realtime-service/pull/67',
  },
];

export const mockAIReview: AIReview = {
  id: 'review-1',
  pullRequestId: '1',
  overallScore: 85,
  summary: 'This pull request implements a comprehensive authentication system with good security practices. The code structure is well-organized, but there are some areas for improvement in error handling and test coverage.',
  codeStructure: {
    score: 88,
    comments: [
      'Well-organized component hierarchy',
      'Good separation of concerns between authentication logic and UI',
      'Consider extracting some utility functions for better reusability',
    ],
  },
  codingStandards: {
    score: 82,
    comments: [
      'Consistent naming conventions followed',
      'Good TypeScript usage with proper type definitions',
      'Some functions could benefit from JSDoc comments',
      'Missing prop validation in a few components',
    ],
  },
  possibleBugs: [
    {
      id: 'bug-1',
      type: 'error',
      file: 'src/auth/AuthProvider.tsx',
      line: 45,
      message: 'Potential race condition in token refresh logic',
      code: 'if (token && !isExpired(token)) { refreshToken(); }',
      severity: 'high',
    },
    {
      id: 'bug-2',
      type: 'warning',
      file: 'src/components/LoginForm.tsx',
      line: 23,
      message: 'Missing input validation for email format',
      severity: 'medium',
    },
  ],
  suggestions: [
    {
      id: 'suggestion-1',
      type: 'suggestion',
      file: 'src/auth/authUtils.ts',
      line: 12,
      message: 'Consider using a more secure method for token storage',
      code: 'localStorage.setItem("token", token); // Consider httpOnly cookies instead',
      severity: 'medium',
    },
  ],
  comments: [],
  generatedAt: '2024-01-15T14:20:00Z',
};
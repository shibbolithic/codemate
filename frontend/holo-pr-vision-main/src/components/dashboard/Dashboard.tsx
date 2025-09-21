import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, GitPullRequest, Zap } from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card';
import { NeonBadge } from '@/components/ui/neon-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PRCard } from './PRCard';
import { PRDetailView } from './PRDetailView';
import { PullRequest, mockPullRequests, prReviewAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const Dashboard: React.FC = () => {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  // Load pull requests
  useEffect(() => {
    loadPullRequests();
  }, []);

const loadPullRequests = async () => {
    setLoading(true);
    try {
      console.log('🚀 Attempting to fetch PRs from Railway API...');
      const data = await prReviewAPI.getPullRequests();
      console.log('✅ Successfully fetched PRs from Railway:', data);
      setPullRequests(data);
      toast({
        title: 'Success',
        description: 'Loaded pull requests from Railway API!',
        variant: 'default',
      });
    } catch (error) {
      console.error('❌ All Railway endpoints failed:', error);
      toast({
        title: 'Railway API Error',
        description: 'All Railway endpoints failed. Check console for details.',
        variant: 'destructive',
      });
      // Still use mock data as ultimate fallback
      setPullRequests(mockPullRequests);
    } finally {
      setLoading(false);
    }
  };

  // Filter pull requests
  const filteredPRs = pullRequests.filter(pr => {
    const matchesSearch = pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pr.repository.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pr.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status summary
  const statusCounts = pullRequests.reduce((acc, pr) => {
    acc[pr.status] = (acc[pr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (selectedPR) {
    return (
      <PRDetailView
        pullRequest={selectedPR}
        onBack={() => setSelectedPR(null)}
      />
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-primary/20 border border-primary/30 animate-pulse-glow">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold holo-text">
            PR Review Agent
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          AI-powered code review analysis with holographic insights
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard variant="compact" glow="primary" className="animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total PRs</p>
              <p className="text-2xl font-bold text-primary">{pullRequests.length}</p>
            </div>
            <GitPullRequest className="w-8 h-8 text-primary/70" />
          </div>
        </GlassCard>
        
        <GlassCard variant="compact" glow="success" className="animate-slide-up delay-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-success">{statusCounts.approved || 0}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-success" />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="compact" className="animate-slide-up delay-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Reviewed</p>
              <p className="text-2xl font-bold text-primary">{statusCounts.reviewed || 0}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="compact" className="animate-slide-up delay-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-warning">{statusCounts.pending || 0}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-warning" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters and Search */}
      <GlassCard className="animate-slide-up">
        <GlassCardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search pull requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-glass border-glass-border"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-glass border border-glass-border rounded-lg px-3 py-2 text-sm text-foreground"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <Button
                onClick={loadPullRequests}
                disabled={loading}
                variant="outline"
                size="sm"
                className="bg-glass border-glass-border hover:bg-primary/10"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Pull Requests Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filteredPRs.length === 0 ? (
        <GlassCard className="text-center py-12">
          <GlassCardContent>
            <GitPullRequest className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Pull Requests Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No pull requests available at the moment.'
              }
            </p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPRs.map((pr, index) => (
            <PRCard
              key={pr.id}
              pullRequest={pr}
              onClick={() => setSelectedPR(pr)}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
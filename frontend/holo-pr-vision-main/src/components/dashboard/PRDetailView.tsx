import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  GitBranch, 
  User, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Bug,
  Lightbulb,
  Star,
  Zap
} from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card';
import { NeonBadge } from '@/components/ui/neon-badge';
import { Button } from '@/components/ui/button';
import { PullRequest, AIReview, ReviewComment, mockAIReview, prReviewAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PRDetailViewProps {
  pullRequest: PullRequest;
  onBack: () => void;
}

const severityConfig = {
  low: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
  medium: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  high: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
};

const typeIcons = {
  suggestion: Lightbulb,
  warning: AlertTriangle,
  error: Bug,
  info: Info,
};

const CommentCard: React.FC<{ comment: ReviewComment; index: number }> = ({ comment, index }) => {
  const Icon = typeIcons[comment.type];
  const severity = severityConfig[comment.severity];
  
  return (
    <GlassCard 
      className={cn(
        'animate-slide-up border-l-4',
        comment.type === 'error' ? 'border-l-destructive' :
        comment.type === 'warning' ? 'border-l-warning' :
        comment.type === 'suggestion' ? 'border-l-accent' :
        'border-l-primary'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <GlassCardContent>
        <div className="flex items-start gap-3">
          <div className={cn(
            'p-2 rounded-lg flex-shrink-0',
            comment.type === 'error' ? 'bg-destructive/10 text-destructive' :
            comment.type === 'warning' ? 'bg-warning/10 text-warning' :
            comment.type === 'suggestion' ? 'bg-accent/10 text-accent' :
            'bg-primary/10 text-primary'
          )}>
            <Icon className="w-4 h-4" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-mono text-sm text-accent">
                {comment.file}:{comment.line}
              </div>
              <NeonBadge 
                variant={comment.severity === 'high' ? 'destructive' : 
                        comment.severity === 'medium' ? 'warning' : 'success'}
                size="sm"
              >
                {comment.severity}
              </NeonBadge>
            </div>
            
            <p className="text-foreground">{comment.message}</p>
            
            {comment.code && (
              <div className="code-block">
                <pre className="text-xs overflow-x-auto">
                  <code>{comment.code}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};

const ScoreSection: React.FC<{ title: string; score: number; comments: string[] }> = ({ 
  title, 
  score, 
  comments 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <GlassCardTitle className="text-lg">{title}</GlassCardTitle>
          <div className={cn('text-2xl font-bold', getScoreColor(score))}>
            {score}/100
          </div>
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-3">
          <div className="w-full bg-secondary/50 rounded-full h-3">
            <div
              className={cn(
                'h-3 rounded-full transition-all duration-1000',
                score >= 90 ? 'bg-success' :
                score >= 70 ? 'bg-warning' :
                'bg-destructive'
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          <ul className="space-y-2">
            {comments.map((comment, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>{comment}</span>
              </li>
            ))}
          </ul>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};

export const PRDetailView: React.FC<PRDetailViewProps> = ({ pullRequest, onBack }) => {
  const [aiReview, setAIReview] = useState<AIReview | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAIReview();
  }, [pullRequest.id]);

  const loadAIReview = async () => {
    setLoading(true);
    try {
      console.log(`🤖 Attempting to fetch AI review for PR ${pullRequest.id} from Railway...`);
      const review = await prReviewAPI.getAIReview(pullRequest.id);
      console.log('✅ Successfully fetched AI review from Railway:', review);
      setAIReview(review);
      toast({
        title: 'Success',
        description: 'Loaded AI review from Railway API!',
        variant: 'default',
      });
    } catch (error) {
      console.error('❌ All Railway review endpoints failed:', error);
      toast({
        title: 'Railway API Error',
        description: 'All Railway review endpoints failed. Check console for details.',
        variant: 'destructive',
      });
      // Use mock data as fallback
      setAIReview(mockAIReview);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="bg-glass border-glass-border hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold holo-text">
            {pullRequest.title}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{pullRequest.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitBranch className="w-4 h-4" />
              <span className="font-mono">{pullRequest.branch}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(pullRequest.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NeonBadge variant="accent" glow="strong">
            {pullRequest.repository}
          </NeonBadge>
          <Button
            onClick={() => window.open(pullRequest.url, '_blank')}
            variant="outline"
            size="sm"
            className="bg-glass border-glass-border hover:bg-primary/10"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on GitHub
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : aiReview ? (
        <div className="space-y-6">
          {/* Overall Score */}
          <GlassCard glow="primary" className="animate-slide-up">
            <GlassCardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-primary/20 border border-primary/30 animate-pulse-glow">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">AI Review Score</h2>
                    <p className="text-muted-foreground">Overall code quality assessment</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary flex items-center gap-2">
                    <Star className="w-8 h-8" />
                    {aiReview.overallScore}/100
                  </div>
                  <div className="mt-2 w-32 bg-secondary/50 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-1000"
                      style={{ width: `${aiReview.overallScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Summary */}
          <GlassCard className="animate-slide-up">
            <GlassCardHeader>
              <GlassCardTitle>AI Analysis Summary</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <p className="text-foreground leading-relaxed">{aiReview.summary}</p>
            </GlassCardContent>
          </GlassCard>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreSection
              title="Code Structure"
              score={aiReview.codeStructure.score}
              comments={aiReview.codeStructure.comments}
            />
            <ScoreSection
              title="Coding Standards"
              score={aiReview.codingStandards.score}
              comments={aiReview.codingStandards.comments}
            />
          </div>

          {/* Issues and Suggestions */}
          {aiReview.possibleBugs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-destructive flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Possible Issues ({aiReview.possibleBugs.length})
              </h2>
              <div className="space-y-4">
                {aiReview.possibleBugs.map((comment, index) => (
                  <CommentCard key={comment.id} comment={comment} index={index} />
                ))}
              </div>
            </div>
          )}

          {aiReview.suggestions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-accent flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Suggestions ({aiReview.suggestions.length})
              </h2>
              <div className="space-y-4">
                {aiReview.suggestions.map((comment, index) => (
                  <CommentCard key={comment.id} comment={comment} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Review Metadata */}
          <GlassCard className="animate-slide-up">
            <GlassCardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>AI Review generated on {formatDate(aiReview.generatedAt)}</span>
                <span>Review ID: {aiReview.id}</span>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      ) : (
        <GlassCard className="text-center py-12">
          <GlassCardContent>
            <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Review Available</h3>
            <p className="text-muted-foreground">
              AI review data is not available for this pull request.
            </p>
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  );
};
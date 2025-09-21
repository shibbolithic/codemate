import React from 'react';
import { Calendar, GitBranch, User, ExternalLink, Star } from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassCardFooter } from '@/components/ui/glass-card';
import { NeonBadge } from '@/components/ui/neon-badge';
import { PullRequest } from '@/lib/api';
import { cn } from '@/lib/utils';

interface PRCardProps {
  pullRequest: PullRequest;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const statusConfig = {
  pending: {
    variant: 'warning' as const,
    glow: 'subtle' as const,
    text: 'Pending Review',
  },
  reviewed: {
    variant: 'default' as const,
    glow: 'subtle' as const,
    text: 'Reviewed',
  },
  approved: {
    variant: 'success' as const,
    glow: 'strong' as const,
    text: 'Approved',
  },
  rejected: {
    variant: 'destructive' as const,
    glow: 'subtle' as const,
    text: 'Rejected',
  },
};

const getScoreColor = (score: number | undefined) => {
  if (!score) return 'text-muted-foreground';
  if (score >= 90) return 'text-success';
  if (score >= 70) return 'text-warning';
  return 'text-destructive';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const PRCard: React.FC<PRCardProps> = ({ pullRequest, onClick, className, style }) => {
  const statusInfo = statusConfig[pullRequest.status];

  return (
    <GlassCard
      variant="floating"
      className={cn(
        'cursor-pointer group hover:scale-105 transition-all duration-300',
        'hover:shadow-2xl hover:shadow-primary/20',
        'animate-fade-in',
        className
      )}
      style={style}
      onClick={onClick}
    >
      <GlassCardHeader>
        <div className="flex items-start justify-between">
          <GlassCardTitle className="holo-text group-hover:text-primary transition-colors">
            {pullRequest.title}
          </GlassCardTitle>
          <div className="flex items-center gap-2">
            {pullRequest.reviewScore && (
              <div className={cn(
                'flex items-center gap-1 text-sm font-semibold',
                getScoreColor(pullRequest.reviewScore)
              )}>
                <Star className="w-4 h-4" />
                {pullRequest.reviewScore}
              </div>
            )}
            <NeonBadge
              variant={statusInfo.variant}
              glow={statusInfo.glow}
            >
              {statusInfo.text}
            </NeonBadge>
          </div>
        </div>
      </GlassCardHeader>

      <GlassCardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{pullRequest.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitBranch className="w-4 h-4" />
              <span className="font-mono text-xs">{pullRequest.branch}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-accent font-medium">
              {pullRequest.repository}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(pullRequest.updatedAt)}</span>
            </div>
          </div>

          {pullRequest.status === 'reviewed' && pullRequest.reviewScore && (
            <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">AI Review Score</span>
                <div className={cn(
                  'text-lg font-bold',
                  getScoreColor(pullRequest.reviewScore)
                )}>
                  {pullRequest.reviewScore}/100
                </div>
              </div>
              <div className="mt-2 w-full bg-secondary/50 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-500',
                    pullRequest.reviewScore >= 90 ? 'bg-success' :
                    pullRequest.reviewScore >= 70 ? 'bg-warning' :
                    'bg-destructive'
                  )}
                  style={{ width: `${pullRequest.reviewScore}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </GlassCardContent>

      <GlassCardFooter>
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-muted-foreground">
            Updated {formatDate(pullRequest.updatedAt)}
          </div>
          <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">View Details</span>
          </div>
        </div>
      </GlassCardFooter>
    </GlassCard>
  );
};
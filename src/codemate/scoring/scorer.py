def score_from_issues(issues):
    # Simple example scoring: start at 100, subtract 5 per 'error' and 2 per 'warning'
    score = 100
    for it in issues:
        sev = it.get('severity', 'info')
        if sev == 'error':
            score -= 5
        elif sev == 'warning':
            score -= 2
    return max(0, score)

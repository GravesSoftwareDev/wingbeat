from django.shortcuts import render
from django.views.decorators.http import require_http_methods
from .models import Score

LEADERBOARD_LIMIT = 10

def index(request):
    """Main game page."""
    return render(request, 'game/index.html', {
        'top_scores': Score.objects.all()[:LEADERBOARD_LIMIT]
    })

@require_http_methods(['GET'])
def leaderboard(request):
    """HTMX fragment: top scores list."""
    return render(request, 'game/_leaderboard.html',{
        'top_scores': Score.objects.all()[:LEADERBOARD_LIMIT]
    })

@require_http_methods(['POST'])
def submit_score(request):
    """HTMX endpoint: accept a score, return updated leaderboard fragment."""
    #TODO: validation/anit-cheat
    name = request.POST.get('player_initials').strip()[:20]
    raw_score = request.POST.get('score','0')

    try:
        score_value = int(raw_score)
    except(TypeError, ValueError):
        score_value = 0

    if name and 0 <= score_value <=100_000:
        Score.objects.create(player_name=name, score=score_value)

    return render(request, 'game/_leaderboard.html',{
        'top_scores': Score.objects.all()[:LEADERBOARD_LIMIT],
    })


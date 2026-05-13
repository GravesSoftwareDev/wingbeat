from django.contrib import admin
from .models import Score

@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ('player_initials', 'score', 'created_at')
    list_filter = ('player_initials','score', 'created_at')
    search_fields = ('player_initials',)
    ordering = ('-score', 'created_at')


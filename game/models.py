from django.db import models

class Score(models.Model):
    player_initials = models.CharField(max_length=3)
    score = models.PositiveBigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score','created_at']
        indexes = [
            models.Index(fields=['-score']),
        ]

    def __str__(self):
        return f'{self.player_initials}---> {self.score}'
    
    
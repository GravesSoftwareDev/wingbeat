from django.urls import path
from . import views

app_name = 'game'

urlpatterns = [
    path('',views.index, name='index'),
    path('leaderboard/',views.leaderboard, name='leaderboard'),
    path('scores/', views.submit_score, name='submit_score')
]

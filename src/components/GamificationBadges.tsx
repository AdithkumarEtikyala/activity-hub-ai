import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Trophy, Star, Award } from 'lucide-react';

const GamificationBadges = () => {
  const { user } = useAuth();
  const { userStats, loading, badges, getUserLevel, getProgressToNextLevel } = useGamification(user?.uid || '');

  if (loading || !userStats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentLevel = getUserLevel(userStats.points);
  const progressToNext = getProgressToNextLevel(userStats.points);
  const earnedBadges = badges.filter(badge => userStats.badges.includes(badge.id));
  const availableBadges = badges.filter(badge => !userStats.badges.includes(badge.id));

  return (
    <div className="space-y-6">
      {/* Level and Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>Level {currentLevel}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>{userStats.points} points</span>
              <span>{100 - progressToNext} points to next level</span>
            </div>
            <Progress value={progressToNext} className="w-full" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-600">{userStats.eventsAttended}</div>
                <div className="text-gray-600">Events Attended</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{userStats.eventsCreated}</div>
                <div className="text-gray-600">Events Created</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-gold-500" />
              <span>Your Badges ({earnedBadges.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => (
                <div key={badge.id} className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <div className="font-semibold text-sm">{badge.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{badge.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Badges */}
      {availableBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-gray-500" />
              <span>Available Badges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableBadges.map((badge) => {
                let progress = 0;
                let current = 0;
                
                switch (badge.type) {
                  case 'events':
                    current = userStats.eventsAttended;
                    break;
                  case 'comments':
                    current = userStats.commentsPosted;
                    break;
                  case 'special':
                    if (badge.id === 'event-creator' || badge.id === 'community-builder') {
                      current = userStats.eventsCreated;
                    }
                    break;
                }
                
                progress = Math.min((current / badge.requirement) * 100, 100);
                
                return (
                  <div key={badge.id} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-75">
                    <div className="text-2xl mb-2 grayscale">{badge.icon}</div>
                    <div className="font-semibold text-sm text-gray-700">{badge.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{badge.description}</div>
                    <div className="mt-2">
                      <Progress value={progress} className="h-1" />
                      <div className="text-xs text-gray-500 mt-1">
                        {current}/{badge.requirement}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GamificationBadges;
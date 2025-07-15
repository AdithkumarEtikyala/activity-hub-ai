import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export interface UserStats {
  points: number;
  eventsAttended: number;
  eventsCreated: number;
  commentsPosted: number;
  likesGiven: number;
  badges: string[];
  level: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'events' | 'comments' | 'likes' | 'special';
}

const BADGES: Badge[] = [
  { id: 'first-event', name: 'First Timer', description: 'Attended your first event', icon: '🎉', requirement: 1, type: 'events' },
  { id: 'event-enthusiast', name: 'Event Enthusiast', description: 'Attended 5 events', icon: '🌟', requirement: 5, type: 'events' },
  { id: 'super-attendee', name: 'Super Attendee', description: 'Attended 20 events', icon: '🏆', requirement: 20, type: 'events' },
  { id: 'social-butterfly', name: 'Social Butterfly', description: 'Posted 10 comments', icon: '🦋', requirement: 10, type: 'comments' },
  { id: 'event-creator', name: 'Event Creator', description: 'Created your first event', icon: '🎭', requirement: 1, type: 'special' },
  { id: 'community-builder', name: 'Community Builder', description: 'Created 5 events', icon: '🏗️', requirement: 5, type: 'special' },
];

export const useGamification = (userId: string) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    fetchUserStats();
  }, [userId]);

  const fetchUserStats = async () => {
    try {
      const userStatsDoc = await getDoc(doc(db, 'userStats', userId));
      if (userStatsDoc.exists()) {
        setUserStats(userStatsDoc.data() as UserStats);
      } else {
        const initialStats: UserStats = {
          points: 0,
          eventsAttended: 0,
          eventsCreated: 0,
          commentsPosted: 0,
          likesGiven: 0,
          badges: [],
          level: 1
        };
        await setDoc(doc(db, 'userStats', userId), initialStats);
        setUserStats(initialStats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (statType: keyof UserStats, increment: number = 1) => {
    if (!userId || !userStats) return;

    try {
      const updates: any = {};
      updates[statType] = increment;
      updates.points = increment * getPointsForAction(statType);

      await updateDoc(doc(db, 'userStats', userId), updates);
      
      // Check for new badges
      const newStats = {
        ...userStats,
        [statType]: (userStats[statType] as number) + increment,
        points: userStats.points + (increment * getPointsForAction(statType))
      };

      checkForNewBadges(newStats);
      setUserStats(newStats);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const getPointsForAction = (action: string): number => {
    const pointsMap: { [key: string]: number } = {
      eventsAttended: 10,
      eventsCreated: 25,
      commentsPosted: 5,
      likesGiven: 2,
    };
    return pointsMap[action] || 0;
  };

  const checkForNewBadges = async (stats: UserStats) => {
    const newBadges: string[] = [];

    BADGES.forEach(badge => {
      if (!stats.badges.includes(badge.id)) {
        let qualifies = false;
        
        switch (badge.type) {
          case 'events':
            qualifies = stats.eventsAttended >= badge.requirement;
            break;
          case 'comments':
            qualifies = stats.commentsPosted >= badge.requirement;
            break;
          case 'special':
            if (badge.id === 'event-creator' || badge.id === 'community-builder') {
              qualifies = stats.eventsCreated >= badge.requirement;
            }
            break;
        }

        if (qualifies) {
          newBadges.push(badge.id);
        }
      }
    });

    if (newBadges.length > 0) {
      const updatedBadges = [...stats.badges, ...newBadges];
      await updateDoc(doc(db, 'userStats', userId), {
        badges: updatedBadges
      });

      // Show badge notification
      newBadges.forEach(badgeId => {
        const badge = BADGES.find(b => b.id === badgeId);
        if (badge) {
          toast({
            title: "New Badge Earned! 🎉",
            description: `${badge.icon} ${badge.name}: ${badge.description}`,
          });
        }
      });
    }
  };

  const getUserLevel = (points: number): number => {
    return Math.floor(points / 100) + 1;
  };

  const getProgressToNextLevel = (points: number): number => {
    return points % 100;
  };

  return {
    userStats,
    loading,
    updateStats,
    getUserLevel,
    getProgressToNextLevel,
    badges: BADGES
  };
};
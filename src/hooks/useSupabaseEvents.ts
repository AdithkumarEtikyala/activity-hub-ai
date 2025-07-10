
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupabaseEvent {
  id: string;
  title: string;
  description: string | null;
  image_url?: string | null;
  organizer_id: string | null;
  created_at: string | null;
  category: string | null;
  venue: string | null;
  event_date: string;
  club_id?: string | null;
  google_event_id?: string | null;
  google_calendar_link?: string | null;
  current_attendees: number | null;
  max_attendees?: number | null;
  is_public: boolean | null;
  tags?: string[] | null;
  clubs?: {
    name: string;
    logo_url?: string | null;
  } | null;
  profiles?: {
    full_name: string | null;
    avatar_url?: string | null;
  } | null;
  event_attendees?: Array<{
    id: string;
    user_id: string | null;
    rsvp_status: string | null;
    profiles: {
      full_name: string | null;
      email: string | null;
      avatar_url?: string | null;
    };
  }>;
  likes_count?: number;
  user_has_liked?: boolean;
  user_has_rsvpd?: boolean;
}

export const useSupabaseEvents = () => {
  const [events, setEvents] = useState<SupabaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          clubs(name, logo_url),
          profiles(full_name, avatar_url),
          event_attendees(id, user_id, rsvp_status, profiles(full_name, email, avatar_url))
        `)
        .eq('is_public', true)
        .order('event_date', { ascending: true });

      if (error) throw error;

      // Process events to add user-specific data
      const processedEvents: SupabaseEvent[] = (data || []).map(event => ({
        ...event,
        user_has_rsvpd: user ? event.event_attendees?.some((attendee: any) => attendee.user_id === user.id) : false,
        likes_count: 0, // We'll implement this when we add the likes table
        user_has_liked: false
      }));

      setEvents(processedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const rsvpToEvent = async (eventId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: userId,
          rsvp_status: 'attending'
        });

      if (error) throw error;

      // Update the events state locally
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                current_attendees: (event.current_attendees || 0) + 1,
                user_has_rsvpd: true
              }
            : event
        )
      );

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error RSVPing to event:', error);
      return { success: false, error: error.message };
    }
  };

  const cancelRsvp = async (eventId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update the events state locally
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                current_attendees: Math.max((event.current_attendees || 0) - 1, 0),
                user_has_rsvpd: false
              }
            : event
        )
      );

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error cancelling RSVP:', error);
      return { success: false, error: error.message };
    }
  };

  const likeEvent = async (eventId: string, userId: string) => {
    // For now, just return success - we'll implement this when we add the likes table
    return { success: true, error: null };
  };

  const unlikeEvent = async (eventId: string, userId: string) => {
    // For now, just return success - we'll implement this when we add the likes table
    return { success: true, error: null };
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      await fetchEvents();
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error deleting event:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    events,
    loading,
    fetchEvents,
    rsvpToEvent,
    cancelRsvp,
    likeEvent,
    unlikeEvent,
    deleteEvent
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupabaseEvent {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  organizer_id: string;
  created_at: string;
  category: string;
  venue: string;
  event_date: string;
  club_id?: string;
  google_event_id?: string;
  google_calendar_link?: string;
  current_attendees: number;
  max_attendees?: number;
  is_public: boolean;
  tags?: string[];
  clubs?: {
    name: string;
    logo_url?: string;
  } | null;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  } | null;
  event_attendees?: Array<{
    id: string;
    user_id: string;
    rsvp_status: string;
    profiles: {
      full_name: string;
      email: string;
      avatar_url?: string;
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
      const processedEvents: SupabaseEvent[] = data?.map(event => ({
        ...event,
        user_has_rsvpd: user ? event.event_attendees?.some((attendee: any) => attendee.user_id === user.id) : false,
        likes_count: 0, // We'll implement this when we add the likes table
        user_has_liked: false
      })) || [];

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
                current_attendees: event.current_attendees + 1,
                user_has_rsvpd: true
              }
            : event
        )
      );

      return { success: true };
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
                current_attendees: Math.max(event.current_attendees - 1, 0),
                user_has_rsvpd: false
              }
            : event
        )
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error cancelling RSVP:', error);
      return { success: false, error: error.message };
    }
  };

  const likeEvent = async (eventId: string, userId: string) => {
    // For now, just return success - we'll implement this when we add the likes table
    return { success: true };
  };

  const unlikeEvent = async (eventId: string, userId: string) => {
    // For now, just return success - we'll implement this when we add the likes table
    return { success: true };
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      await fetchEvents();
      return { success: true };
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

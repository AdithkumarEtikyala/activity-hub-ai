
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Heart, MessageCircle, Share2, BookmarkPlus, Trash2, UserX } from "lucide-react";
import { useAuth } from "@/contexts/FirebaseAuthContext";
import { useSupabaseEvents } from "@/hooks/useSupabaseEvents";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const SupabaseEventFeed = () => {
  const { events, loading, rsvpToEvent, cancelRsvp, likeEvent, unlikeEvent, deleteEvent } = useSupabaseEvents();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleRSVP = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to RSVP to events",
        variant: "destructive"
      });
      return;
    }

    const result = await rsvpToEvent(eventId, user.uid);
    if (result.success) {
      toast({
        title: "Success!",
        description: "You've successfully RSVP'd to this event",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to RSVP to event",
        variant: "destructive"
      });
    }
  };

  const handleCancelRSVP = async (eventId: string) => {
    if (!user) return;

    const result = await cancelRsvp(eventId, user.uid);
    if (result.success) {
      toast({
        title: "RSVP Cancelled",
        description: "Your RSVP has been cancelled",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to cancel RSVP",
        variant: "destructive"
      });
    }
  };

  const handleLike = async (eventId: string) => {
    if (!user) return;

    const event = events.find(e => e.id === eventId);
    const result = event?.user_has_liked ? await unlikeEvent(eventId, user.uid) : await likeEvent(eventId, user.uid);
    
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;

    const result = await deleteEvent(eventId);
    if (result.success) {
      toast({
        title: "Event Deleted",
        description: "Event has been successfully deleted",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const isEventOrganizer = (event: any) => {
    return user && event.organizer_id === user.uid;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading events...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <p className="text-gray-600">No events available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={event.profiles?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                    {event.profiles?.full_name?.charAt(0) || 'O'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{event.profiles?.full_name || 'Event Organizer'}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.event_date).toLocaleDateString()}
                  </p>
                  {event.clubs && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {event.clubs.name}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {event.category}
                </Badge>
                {isEventOrganizer(event) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-4">
            {event.image_url && (
              <div className="relative mb-4 rounded-lg overflow-hidden">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-black/50 text-white border-0">
                    <Users className="w-3 h-3 mr-1" />
                    {event.current_attendees}
                  </Badge>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
              
              <p className="text-gray-600">{event.description}</p>

              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{new Date(event.event_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>{event.venue}</span>
                </div>
              </div>

              {event.google_calendar_link && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(event.google_calendar_link, '_blank')}
                  className="w-full"
                >
                  Add to Google Calendar
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-2 ${event.user_has_liked ? 'text-red-600' : 'text-gray-600'}`}
                  onClick={() => handleLike(event.id)}
                >
                  <Heart className={`w-4 h-4 ${event.user_has_liked ? 'fill-current' : ''}`} />
                  {event.likes_count || 0}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  Comment
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                {isEventOrganizer(event) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        View Members ({event.current_attendees})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Event Attendees</DialogTitle>
                        <DialogDescription>
                          Members who have RSVP'd to {event.title}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-96">
                        <div className="space-y-3">
                          {event.event_attendees?.map((attendee: any) => (
                            <div key={attendee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={attendee.profiles.avatar_url} />
                                  <AvatarFallback>
                                    {attendee.profiles.full_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{attendee.profiles.full_name}</p>
                                  <p className="text-xs text-gray-500">{attendee.profiles.email}</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {attendee.rsvp_status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
                
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <BookmarkPlus className="w-4 h-4" />
                </Button>
                
                {!isEventOrganizer(event) && (
                  <>
                    {event.user_has_rsvpd ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCancelRSVP(event.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Cancel RSVP
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => handleRSVP(event.id)}
                        disabled={!user}
                      >
                        {!user ? 'Sign in to RSVP' : 'RSVP'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SupabaseEventFeed;

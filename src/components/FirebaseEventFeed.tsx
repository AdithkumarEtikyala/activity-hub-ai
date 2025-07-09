
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Heart, MessageCircle, Share2, BookmarkPlus } from "lucide-react";
import { useAuth } from "@/contexts/FirebaseAuthContext";
import { useEvents, rsvpToEvent } from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";

const FirebaseEventFeed = () => {
  const { events, loading } = useEvents();
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

    try {
      await rsvpToEvent(eventId, user.uid);
      toast({
        title: "Success!",
        description: "You've successfully RSVP'd to this event",
      });
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      toast({
        title: "Error",
        description: "Failed to RSVP to event",
        variant: "destructive"
      });
    }
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
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                    {event.title.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">Event Organizer</p>
                  <p className="text-sm text-gray-500">
                    {event.eventDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {event.category}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pb-4">
            {/* Event Image */}
            {event.imageUrl && (
              <div className="relative mb-4 rounded-lg overflow-hidden">
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-black/50 text-white border-0">
                    <Users className="w-3 h-3 mr-1" />
                    {event.rsvp.length}
                  </Badge>
                </div>
              </div>
            )}

            {/* Event Details */}
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
                  <span>{event.eventDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
                  <Heart className="w-4 h-4" />
                  {event.likes.length}
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
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <BookmarkPlus className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => handleRSVP(event.id)}
                  disabled={!user || event.rsvp.includes(user?.uid || '')}
                >
                  {!user ? 'Sign in to RSVP' : event.rsvp.includes(user.uid) ? 'RSVP\'d' : 'RSVP'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FirebaseEventFeed;

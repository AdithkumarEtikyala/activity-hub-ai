
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Sparkles, Bell, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import EventFeed from "@/components/EventFeed";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: "Smart Event Discovery",
      description: "AI-powered recommendations based on your interests and activity"
    },
    {
      icon: Users,
      title: "Club Management",
      description: "Connect with clubs and manage memberships seamlessly"
    },
    {
      icon: Sparkles,
      title: "AI-Generated Content",
      description: "Auto-generate event captions, posters, and summaries"
    },
    {
      icon: Bell,
      title: "Real-time Notifications",
      description: "Never miss important events and updates"
    },
    {
      icon: Search,
      title: "Advanced Filtering",
      description: "Find events by category, date, department, and skills"
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Track engagement and participation metrics"
    }
  ];

  const handleAuthAction = (mode: 'login' | 'signup') => {
    navigate('/auth');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar onAuthAction={handleAuthAction} />
      
      <Hero onAuthAction={handleAuthAction} />
      
      {/* Features Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700">
            Why Choose CampusConnect?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Campus Life
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From event discovery to club management, we've got your campus social life covered
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Live Event Feed */}
      <section className="py-20 px-4 bg-white/30 backdrop-blur-sm" id="events">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-700">
              {user ? 'Your Campus Events' : 'Live Feed Preview'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Discover Campus Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {user 
                ? 'RSVP to events and connect with your campus community' 
                : 'Stay connected with everything happening on your campus'
              }
            </p>
          </div>
          
          <EventFeed />
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Transform Your Campus Experience?
                </h2>
                <p className="text-xl mb-8 text-blue-100">
                  Join thousands of students already using CampusConnect to stay engaged
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8"
                    onClick={() => handleAuthAction('signup')}
                  >
                    Get Started Free
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8"
                    onClick={() => handleAuthAction('login')}
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;

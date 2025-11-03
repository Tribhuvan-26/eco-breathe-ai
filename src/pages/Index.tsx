import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Wind, TrendingDown, BarChart3, Users, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AQIBadge from '@/components/AQIBadge';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentAQI, setCurrentAQI] = useState<number | null>(null);
  const [currentCity, setCurrentCity] = useState('Fetching location...');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchAQI(latitude, longitude);
          },
          () => {
            // Fallback to a default city
            fetchAQIByCity('New Delhi');
          }
        );
      } else {
        fetchAQIByCity('New Delhi');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLoading(false);
    }
  };

  const fetchAQI = async (lat: number, lon: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-air-quality', {
        body: { lat, lon }
      });

      if (error) throw error;

      const aqi = data.list[0].main.aqi;
      setCurrentAQI(aqi);
      setCurrentCity('Your Location');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching AQI:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch air quality data',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const fetchAQIByCity = async (city: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-air-quality', {
        body: { city }
      });

      if (error) throw error;

      const aqi = data.list[0].main.aqi;
      setCurrentAQI(aqi);
      setCurrentCity(city);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching AQI:', error);
      setLoading(false);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: 'Subscribed!',
        description: 'You will receive daily air quality updates',
      });
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <nav className="relative px-6 py-4 flex justify-between items-center backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Wind className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">AeroSense</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate('/citizen')}>
              Citizen Dashboard
            </Button>
            <Button variant="ghost" onClick={() => navigate('/policymaker')}>
              Policymaker Dashboard
            </Button>
          </div>
        </nav>

        <div className="relative px-6 py-20 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                AI-Powered Urban Air Pollution Awareness
              </h1>
              <p className="text-xl text-muted-foreground">
                Real-time air quality monitoring, AI-driven forecasting, and actionable insights for healthier cities
              </p>
              <div className="flex gap-4 pt-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/citizen')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                >
                  View Citizen Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/policymaker')}
                >
                  Policymaker Dashboard
                </Button>
              </div>
            </div>

            <Card className="p-8 bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{loading ? 'Loading...' : currentCity}</h3>
              </div>
              {!loading && currentAQI && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-foreground mb-2">{currentAQI}</div>
                    <AQIBadge aqi={currentAQI} />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Live Air Quality Index
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Comprehensive Air Quality Solutions
          </h2>
          <p className="text-xl text-muted-foreground">
            Powered by AI and real-time data from multiple sources
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm">
            <TrendingDown className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">AI Forecasting</h3>
            <p className="text-muted-foreground">
              Predict pollution levels 3-5 days ahead using advanced ML models
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Health Insights</h3>
            <p className="text-muted-foreground">
              Personalized recommendations based on real-time air quality
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm">
            <BarChart3 className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Policy Analytics</h3>
            <p className="text-muted-foreground">
              Data-driven insights for effective pollution control measures
            </p>
          </Card>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="px-6 py-20 bg-secondary/30">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold text-foreground">Powered By</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Card className="px-6 py-3 bg-card/80">
              <span className="font-semibold">OpenWeatherMap API</span>
            </Card>
            <Card className="px-6 py-3 bg-card/80">
              <span className="font-semibold">Google Gemini AI</span>
            </Card>
            <Card className="px-6 py-3 bg-card/80">
              <span className="font-semibold">React + TypeScript</span>
            </Card>
            <Card className="px-6 py-3 bg-card/80">
              <span className="font-semibold">Lovable Cloud</span>
            </Card>
          </div>
        </div>
      </div>

      {/* Subscribe Section */}
      <div className="px-6 py-20 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Get Daily Air Quality Updates
        </h2>
        <p className="text-muted-foreground mb-8">
          Subscribe to receive personalized alerts and recommendations
        </p>
        <form onSubmit={handleSubscribe} className="flex gap-4 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            Subscribe
          </Button>
        </form>
      </div>

      {/* Footer */}
      <footer className="px-6 py-12 bg-secondary/20 border-t">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>© 2025 AeroSense. Built for healthier urban environments.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
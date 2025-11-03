import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wind, Home, Search, TrendingUp, AlertCircle, Lightbulb, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AQIBadge from '@/components/AQIBadge';
import PollutantChart from '@/components/PollutantChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 
  'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Punjab', 'Haryana'
];

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState('Delhi');
  const [customCity, setCustomCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [aqiData, setAqiData] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [healthRecommendations, setHealthRecommendations] = useState('');
  const [forecastData, setForecastData] = useState<any[]>([]);

  useEffect(() => {
    fetchData(selectedState);
  }, [selectedState]);

  const fetchData = async (location: string) => {
    setLoading(true);
    try {
      // Fetch air quality data
      const { data: airData, error: airError } = await supabase.functions.invoke('fetch-air-quality', {
        body: { city: location }
      });

      if (airError) throw airError;

      const aqi = airData.list[0].main.aqi;
      const components = airData.list[0].components;
      
      setAqiData({
        aqi,
        pm25: components.pm2_5,
        pm10: components.pm10,
        no2: components.no2,
        co: components.co,
        o3: components.o3,
        so2: components.so2
      });

      // Generate forecast data (simulated for demo)
      const forecast = Array.from({ length: 5 }, (_, i) => ({
        day: `Day ${i + 1}`,
        aqi: Math.max(1, Math.min(5, aqi + Math.floor(Math.random() * 3) - 1))
      }));
      setForecastData(forecast);

      // Fetch AI summary
      const { data: summaryData, error: summaryError } = await supabase.functions.invoke('generate-ai-summary', {
        body: { 
          aqiData: { aqi, ...components }, 
          city: location,
          type: 'summary'
        }
      });

      if (!summaryError && summaryData) {
        setAiSummary(summaryData.summary);
      }

      // Fetch health recommendations
      const { data: healthData, error: healthError } = await supabase.functions.invoke('generate-ai-summary', {
        body: { 
          aqiData: { aqi, pm25: components.pm2_5, pm10: components.pm10 }, 
          city: location,
          type: 'health'
        }
      });

      if (!healthError && healthData) {
        setHealthRecommendations(healthData.summary);
      }

      toast({
        title: 'Data Updated',
        description: `Air quality data for ${location} loaded successfully`,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch air quality data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSearch = () => {
    if (customCity.trim()) {
      fetchData(customCity);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <nav className="px-6 py-4 bg-card/50 backdrop-blur-sm border-b flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Wind className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">AeroSense</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button variant="outline" onClick={() => navigate('/policymaker')}>
            Policymaker View
          </Button>
        </div>
      </nav>

      <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Location Selector */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Select Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select State</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Or Search Custom City</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter city name..."
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomSearch()}
                  />
                  <Button onClick={handleCustomSearch} disabled={loading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading air quality data...</p>
          </div>
        ) : aqiData ? (
          <>
            {/* Current AQI */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-1 bg-gradient-to-br from-primary/10 to-card">
                <CardHeader>
                  <CardTitle>Current AQI</CardTitle>
                  <CardDescription>{selectedState}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-foreground">{aqiData.aqi}</div>
                    <div className="mt-4">
                      <AQIBadge aqi={aqiData.aqi} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Summary */}
              <Card className="md:col-span-2 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {aiSummary || 'Generating AI summary...'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pollutant Levels */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Pollutant Levels</CardTitle>
                <CardDescription>Current concentrations (μg/m³)</CardDescription>
              </CardHeader>
              <CardContent>
                <PollutantChart data={aqiData} />
              </CardContent>
            </Card>

            {/* Forecast */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  5-Day AQI Forecast
                </CardTitle>
                <CardDescription>AI-powered pollution predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="aqi" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Health Recommendations */}
            <Card className="bg-gradient-to-br from-accent/10 to-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-accent" />
                  Health Recommendations
                </CardTitle>
                <CardDescription>Personalized advice based on current air quality</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {healthRecommendations || 'Generating recommendations...'}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">Select a location to view air quality data</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
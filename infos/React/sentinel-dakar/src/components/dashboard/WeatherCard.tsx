import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer } from "lucide-react";

const weatherData = {
  location: "Dakar, Sénégal",
  current: {
    temperature: 28,
    condition: "Partiellement nuageux",
    humidity: 75,
    windSpeed: 12,
    precipitation: 2.5,
    icon: Cloud,
  },
  forecast: [
    { day: "Aujourd'hui", temp: "28°", rain: "15%", icon: Cloud },
    { day: "Demain", temp: "26°", rain: "65%", icon: CloudRain },
    { day: "Après-demain", temp: "30°", rain: "5%", icon: Sun },
  ],
};

export function WeatherCard() {
  const CurrentIcon = weatherData.current.icon;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Conditions Météo</span>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            ANACIM
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current weather */}
        <div className="text-center p-4 rounded-lg gradient-ocean text-primary-foreground">
          <p className="text-sm opacity-90 mb-1">{weatherData.location}</p>
          <div className="flex items-center justify-center space-x-3 mb-2">
            <CurrentIcon className="h-8 w-8" />
            <span className="text-3xl font-bold">{weatherData.current.temperature}°C</span>
          </div>
          <p className="text-sm opacity-90">{weatherData.current.condition}</p>
        </div>

        {/* Weather details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
            <Droplets className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Humidité</p>
              <p className="text-sm font-medium">{weatherData.current.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
            <Wind className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Vent</p>
              <p className="text-sm font-medium">{weatherData.current.windSpeed} km/h</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
            <CloudRain className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Précipitations</p>
              <p className="text-sm font-medium">{weatherData.current.precipitation} mm</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
            <Thermometer className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Ressenti</p>
              <p className="text-sm font-medium">{weatherData.current.temperature + 2}°C</p>
            </div>
          </div>
        </div>

        {/* 3-day forecast */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Prévisions</h4>
          <div className="space-y-2">
            {weatherData.forecast.map((day, index) => {
              const DayIcon = day.icon;
              return (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-medium">{day.day}</span>
                  <div className="flex items-center space-x-2">
                    <DayIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium w-10">{day.temp}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      parseInt(day.rain) > 50 ? 'bg-danger/10 text-danger' : 
                      parseInt(day.rain) > 20 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>
                      {day.rain}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
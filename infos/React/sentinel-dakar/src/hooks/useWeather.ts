import { useQuery } from "@tanstack/react-query";

type UseWeatherParams = {
  latitude: number;
  longitude: number;
};

export type WeatherData = {
  locationLabel: string;
  temperatureC: number;
  condition: string;
  humidityPct?: number;
  windKmh?: number;
  precipitationMm?: number;
};

async function fetchOpenMeteo({ latitude, longitude }: UseWeatherParams): Promise<WeatherData> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Weather fetch failed");
  const json = await res.json();

  const current = json?.current ?? {};
  const temperatureC = Number(current?.temperature_2m ?? 0);
  const humidityPct = Number(current?.relative_humidity_2m ?? 0);
  const precipitationMm = Number(current?.precipitation ?? 0);
  // Open-Meteo wind is in m/s or km/h depending on params; default for current is m/s for some endpoints.
  const windMs = Number(current?.wind_speed_10m ?? 0);
  const windKmh = Math.round(windMs * 3.6);

  return {
    locationLabel: "Dakar, Sénégal",
    temperatureC: Math.round(temperatureC),
    condition: precipitationMm > 0.1 ? "Pluie" : "Partiellement nuageux",
    humidityPct,
    windKmh,
    precipitationMm,
  };
}

export function useWeather(params: UseWeatherParams) {
  return useQuery({
    queryKey: ["weather", params.latitude, params.longitude],
    queryFn: () => fetchOpenMeteo(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}






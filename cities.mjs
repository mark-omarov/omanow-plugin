// The only places anyone can be on the map.
// [name, ISO country, lat, lon, weight]; weight only shapes demo data.
const RAW = [
  ["Tokyo", "JP", 35.68, 139.69, 9], ["Osaka", "JP", 34.69, 135.5, 4], ["Sapporo", "JP", 43.06, 141.35, 2],
  ["Seoul", "KR", 37.57, 126.98, 7], ["Busan", "KR", 35.18, 129.08, 2], ["Beijing", "CN", 39.9, 116.4, 5],
  ["Shanghai", "CN", 31.23, 121.47, 6], ["Shenzhen", "CN", 22.54, 114.06, 5], ["Chengdu", "CN", 30.57, 104.07, 3],
  ["Hong Kong", "HK", 22.32, 114.17, 4], ["Taipei", "TW", 25.03, 121.57, 5], ["Manila", "PH", 14.6, 120.98, 3],
  ["Hanoi", "VN", 21.03, 105.85, 2], ["Ho Chi Minh City", "VN", 10.82, 106.63, 3], ["Bangkok", "TH", 13.76, 100.5, 4],
  ["Kuala Lumpur", "MY", 3.14, 101.69, 3], ["Singapore", "SG", 1.35, 103.82, 5], ["Jakarta", "ID", -6.21, 106.85, 4],
  ["Denpasar", "ID", -8.65, 115.22, 2], ["Bengaluru", "IN", 12.97, 77.59, 7], ["Mumbai", "IN", 19.08, 72.88, 5],
  ["Delhi", "IN", 28.61, 77.21, 5], ["Hyderabad", "IN", 17.39, 78.49, 4], ["Chennai", "IN", 13.08, 80.27, 3],
  ["Pune", "IN", 18.52, 73.86, 3], ["Kolkata", "IN", 22.57, 88.36, 2], ["Dhaka", "BD", 23.81, 90.41, 2],
  ["Kathmandu", "NP", 27.72, 85.32, 1], ["Colombo", "LK", 6.93, 79.86, 1], ["Karachi", "PK", 24.86, 67.0, 2],
  ["Lahore", "PK", 31.55, 74.34, 2], ["Tashkent", "UZ", 41.3, 69.24, 1], ["Almaty", "KZ", 43.24, 76.89, 2],
  ["Novosibirsk", "RU", 55.01, 82.93, 1], ["Yekaterinburg", "RU", 56.84, 60.6, 1], ["Vladivostok", "RU", 43.12, 131.89, 1],
  ["Moscow", "RU", 55.76, 37.62, 5], ["Saint Petersburg", "RU", 59.93, 30.34, 3], ["Tehran", "IR", 35.69, 51.39, 2],
  ["Dubai", "AE", 25.2, 55.27, 3], ["Riyadh", "SA", 24.71, 46.68, 2], ["Doha", "QA", 25.29, 51.53, 1],
  ["Tel Aviv", "IL", 32.09, 34.78, 4], ["Amman", "JO", 31.95, 35.93, 1], ["Beirut", "LB", 33.89, 35.5, 1],
  ["Istanbul", "TR", 41.01, 28.98, 5], ["Ankara", "TR", 39.93, 32.86, 2], ["Tbilisi", "GE", 41.72, 44.79, 2],
  ["Yerevan", "AM", 40.18, 44.51, 1], ["Baku", "AZ", 40.41, 49.87, 1], ["Kyiv", "UA", 50.45, 30.52, 4],
  ["Lviv", "UA", 49.84, 24.03, 2], ["Kharkiv", "UA", 49.99, 36.23, 2], ["Minsk", "BY", 53.9, 27.56, 2],
  ["Warsaw", "PL", 52.23, 21.01, 5], ["Kraków", "PL", 50.06, 19.94, 3], ["Wrocław", "PL", 51.11, 17.04, 2],
  ["Gdańsk", "PL", 54.35, 18.65, 2], ["Vilnius", "LT", 54.69, 25.28, 2], ["Riga", "LV", 56.95, 24.11, 2],
  ["Tallinn", "EE", 59.44, 24.75, 3], ["Helsinki", "FI", 60.17, 24.94, 4], ["Stockholm", "SE", 59.33, 18.07, 5],
  ["Gothenburg", "SE", 57.71, 11.97, 2], ["Oslo", "NO", 59.91, 10.75, 4], ["Bergen", "NO", 60.39, 5.32, 1],
  ["Copenhagen", "DK", 55.68, 12.57, 6], ["Aarhus", "DK", 56.16, 10.2, 2], ["Reykjavík", "IS", 64.15, -21.94, 1],
  ["Berlin", "DE", 52.52, 13.4, 8], ["Hamburg", "DE", 53.55, 9.99, 4], ["Munich", "DE", 48.14, 11.58, 5],
  ["Cologne", "DE", 50.94, 6.96, 3], ["Frankfurt", "DE", 50.11, 8.68, 3], ["Stuttgart", "DE", 48.78, 9.18, 2],
  ["Leipzig", "DE", 51.34, 12.37, 2], ["Amsterdam", "NL", 52.37, 4.9, 6], ["Rotterdam", "NL", 51.92, 4.48, 2],
  ["Utrecht", "NL", 52.09, 5.12, 2], ["Brussels", "BE", 50.85, 4.35, 3], ["Antwerp", "BE", 51.22, 4.4, 2],
  ["Luxembourg", "LU", 49.61, 6.13, 1], ["Paris", "FR", 48.86, 2.35, 6], ["Lyon", "FR", 45.76, 4.84, 3],
  ["Marseille", "FR", 43.3, 5.37, 2], ["Toulouse", "FR", 43.6, 1.44, 2], ["Bordeaux", "FR", 44.84, -0.58, 2],
  ["Nantes", "FR", 47.22, -1.55, 1], ["London", "GB", 51.51, -0.13, 8], ["Manchester", "GB", 53.48, -2.24, 3],
  ["Edinburgh", "GB", 55.95, -3.19, 2], ["Bristol", "GB", 51.45, -2.59, 2], ["Dublin", "IE", 53.35, -6.26, 3],
  ["Madrid", "ES", 40.42, -3.7, 4], ["Barcelona", "ES", 41.39, 2.17, 5], ["Valencia", "ES", 39.47, -0.38, 2],
  ["Seville", "ES", 37.39, -5.98, 1], ["Lisbon", "PT", 38.72, -9.14, 4], ["Porto", "PT", 41.15, -8.61, 2],
  ["Zurich", "CH", 47.38, 8.54, 4], ["Geneva", "CH", 46.2, 6.14, 2], ["Vienna", "AT", 48.21, 16.37, 4],
  ["Prague", "CZ", 50.08, 14.44, 4], ["Brno", "CZ", 49.2, 16.61, 2], ["Bratislava", "SK", 48.15, 17.11, 1],
  ["Budapest", "HU", 47.5, 19.04, 3], ["Ljubljana", "SI", 46.06, 14.51, 1], ["Zagreb", "HR", 45.81, 15.98, 2],
  ["Belgrade", "RS", 44.79, 20.45, 2], ["Sarajevo", "BA", 43.86, 18.41, 1], ["Sofia", "BG", 42.7, 23.32, 2],
  ["Bucharest", "RO", 44.43, 26.1, 3], ["Cluj-Napoca", "RO", 46.77, 23.6, 1], ["Chișinău", "MD", 47.01, 28.86, 1],
  ["Athens", "GR", 37.98, 23.73, 2], ["Thessaloniki", "GR", 40.64, 22.94, 1], ["Rome", "IT", 41.9, 12.5, 3],
  ["Milan", "IT", 45.46, 9.19, 4], ["Turin", "IT", 45.07, 7.69, 2], ["Bologna", "IT", 44.49, 11.34, 1],
  ["Naples", "IT", 40.85, 14.27, 1], ["Cairo", "EG", 30.04, 31.24, 3], ["Casablanca", "MA", 33.57, -7.59, 2],
  ["Tunis", "TN", 36.81, 10.18, 1], ["Algiers", "DZ", 36.75, 3.06, 1], ["Lagos", "NG", 6.52, 3.38, 4],
  ["Abuja", "NG", 9.08, 7.4, 1], ["Accra", "GH", 5.6, -0.19, 2], ["Dakar", "SN", 14.72, -17.47, 1],
  ["Nairobi", "KE", -1.29, 36.82, 3], ["Kampala", "UG", 0.35, 32.58, 1], ["Kigali", "RW", -1.94, 30.06, 1],
  ["Addis Ababa", "ET", 9.03, 38.74, 1], ["Dar es Salaam", "TZ", -6.79, 39.21, 1], ["Johannesburg", "ZA", -26.2, 28.05, 3],
  ["Cape Town", "ZA", -33.92, 18.42, 3], ["Harare", "ZW", -17.83, 31.05, 1], ["Luanda", "AO", -8.84, 13.23, 1],
  ["Antananarivo", "MG", -18.88, 47.51, 1], ["Sydney", "AU", -33.87, 151.21, 5], ["Melbourne", "AU", -37.81, 144.96, 5],
  ["Brisbane", "AU", -27.47, 153.03, 3], ["Perth", "AU", -31.95, 115.86, 2], ["Adelaide", "AU", -34.93, 138.6, 2],
  ["Auckland", "NZ", -36.85, 174.76, 3], ["Wellington", "NZ", -41.29, 174.78, 2], ["Christchurch", "NZ", -43.53, 172.64, 1],
  ["Honolulu", "US", 21.31, -157.86, 1], ["Anchorage", "US", 61.22, -149.9, 1], ["San Francisco", "US", 37.77, -122.42, 9],
  ["Los Angeles", "US", 34.05, -118.24, 6], ["San Diego", "US", 32.72, -117.16, 3], ["Seattle", "US", 47.61, -122.33, 6],
  ["Portland", "US", 45.52, -122.68, 4], ["Las Vegas", "US", 36.17, -115.14, 2], ["Phoenix", "US", 33.45, -112.07, 2],
  ["Salt Lake City", "US", 40.76, -111.89, 2], ["Denver", "US", 39.74, -104.99, 4], ["Austin", "US", 30.27, -97.74, 6],
  ["Dallas", "US", 32.78, -96.8, 3], ["Houston", "US", 29.76, -95.37, 3], ["Minneapolis", "US", 44.98, -93.27, 2],
  ["Chicago", "US", 41.88, -87.63, 6], ["Detroit", "US", 42.33, -83.05, 2], ["Nashville", "US", 36.16, -86.78, 2],
  ["Atlanta", "US", 33.75, -84.39, 3], ["Miami", "US", 25.76, -80.19, 3], ["Raleigh", "US", 35.78, -78.64, 2],
  ["Washington", "US", 38.91, -77.04, 4], ["Philadelphia", "US", 39.95, -75.17, 3], ["New York", "US", 40.71, -74.01, 9],
  ["Boston", "US", 42.36, -71.06, 5], ["Pittsburgh", "US", 40.44, -79.99, 2], ["Toronto", "CA", 43.65, -79.38, 6],
  ["Montreal", "CA", 45.5, -73.57, 4], ["Ottawa", "CA", 45.42, -75.7, 2], ["Vancouver", "CA", 49.28, -123.12, 5],
  ["Calgary", "CA", 51.05, -114.07, 2], ["Winnipeg", "CA", 49.9, -97.14, 1], ["Halifax", "CA", 44.65, -63.58, 1],
  ["Mexico City", "MX", 19.43, -99.13, 4], ["Guadalajara", "MX", 20.66, -103.35, 2], ["Monterrey", "MX", 25.69, -100.32, 2],
  ["Guatemala City", "GT", 14.63, -90.51, 1], ["San José", "CR", 9.93, -84.08, 1], ["Panama City", "PA", 8.98, -79.52, 1],
  ["Havana", "CU", 23.11, -82.37, 1], ["Santo Domingo", "DO", 18.49, -69.93, 1], ["San Juan", "PR", 18.47, -66.11, 1],
  ["Bogotá", "CO", 4.71, -74.07, 3], ["Medellín", "CO", 6.24, -75.58, 2], ["Caracas", "VE", 10.48, -66.9, 1],
  ["Quito", "EC", -0.18, -78.47, 1], ["Lima", "PE", -12.05, -77.04, 2], ["La Paz", "BO", -16.5, -68.15, 1],
  ["Santiago", "CL", -33.45, -70.67, 3], ["Buenos Aires", "AR", -34.6, -58.38, 5], ["Córdoba", "AR", -31.42, -64.18, 1],
  ["Montevideo", "UY", -34.9, -56.16, 2], ["Asunción", "PY", -25.26, -57.58, 1], ["São Paulo", "BR", -23.55, -46.63, 7],
  ["Rio de Janeiro", "BR", -22.91, -43.17, 4], ["Belo Horizonte", "BR", -19.92, -43.94, 2], ["Porto Alegre", "BR", -30.03, -51.23, 2],
  ["Curitiba", "BR", -25.43, -49.27, 2], ["Florianópolis", "BR", -27.6, -48.55, 2], ["Brasília", "BR", -15.79, -47.88, 1],
  ["Recife", "BR", -8.05, -34.88, 1], ["Fortaleza", "BR", -3.73, -38.52, 1], ["Manaus", "BR", -3.12, -60.02, 1],
];

const slug = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const CITIES = RAW.map(([name, country, lat, lon, weight]) => ({
  id: `${slug(name)}-${country.toLowerCase()}`,
  name,
  country,
  lat,
  lon,
  weight,
}));

export const CITY_BY_ID = new Map(CITIES.map((c) => [c.id, c]));

export function nearestCity(lat, lon) {
  const r = Math.PI / 180;
  let best = null;
  let bestD = Infinity;
  for (const c of CITIES) {
    const dLat = (c.lat - lat) * r;
    const dLon = (c.lon - lon) * r;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * r) * Math.cos(c.lat * r) * Math.sin(dLon / 2) ** 2;
    if (a < bestD) {
      bestD = a;
      best = c;
    }
  }
  return best;
}

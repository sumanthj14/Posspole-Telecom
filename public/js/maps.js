// Replace 'YOUR_API_KEY' with your actual OLA Maps API Key
const OLA_MAPS_API_KEY = '9Rzw286fzn0tFObFjok4qZlaICuZM0nbUjqe09mN';

// Initialize the OlaMaps instance
const olaMaps = new OlaMaps({
    apiKey: OLA_MAPS_API_KEY, // Pass your API key
});

// Initialize and render the map
const map = olaMaps.init({
    style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
    container: 'map',
    center: [77.61648476788898, 12.931423492103944], // Default to Bangalore
    zoom: 10,
});







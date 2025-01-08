// Replace 'YOUR_API_KEY' with your actual OLA Maps API Key
const OLA_MAPS_API_KEY = '9Rzw286fzn0tFObFjok4qZlaICuZM0nbUjqe09mN';
const REQUEST_ID = 'unique-request-id'; // Replace with a unique request ID

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

// Ensure this function is declared at the top level of the file
const searchByLatLon = () => {
    const latInput = document.getElementById('latitude').value;
    const lonInput = document.getElementById('longitude').value;

    if (!latInput || !lonInput || isNaN(latInput) || isNaN(lonInput)) {
        alert('Please enter valid Latitude and Longitude values.');
        return;
    }

    const latitude = parseFloat(latInput);
    const longitude = parseFloat(lonInput);

    // Re-center the map
    map.setCenter([longitude, latitude]);

    // Add a marker at the specified coordinates
    const marker = olaMaps
        .addMarker({
            offset: [0, -10],
            anchor: 'bottom',
            color: 'blue',
        })
        .setLngLat([longitude, latitude])
        .addTo(map);

    console.log(`Marker added at Latitude: ${latitude}, Longitude: ${longitude}`);
};

// Fetch autocomplete suggestions from the API
const fetchAutocomplete = () => {
    const query = document.getElementById('place').value.trim();
    if (!query) return;

    const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(query)}&api_key=${OLA_MAPS_API_KEY}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'X-Request-Id': REQUEST_ID,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const results = data.predictions || [];
            displayAutocompleteResults(results);
        })
        .catch(error => {
            console.error('Error fetching autocomplete results:', error);
        });
};

// Display autocomplete suggestions in the dropdown
const displayAutocompleteResults = (results) => {
    const autocompleteList = document.getElementById('autocomplete-results');
    autocompleteList.innerHTML = '';

    results.forEach((result) => {
        const listItem = document.createElement('li');
        listItem.textContent = result.description;
        listItem.onclick = () => {
            handleAutocompleteSelection(result.place_id);
        };
        autocompleteList.appendChild(listItem);
    });
};

// Handle the selection of a place from autocomplete suggestions
const handleAutocompleteSelection = (placeId) => {
    const url = `https://api.olamaps.io/places/v1/details?place_id=${placeId}&api_key=${OLA_MAPS_API_KEY}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'X-Request-Id': REQUEST_ID,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const place = data.result;
            const coordinates = place.geometry?.location || [77.61648476788898, 12.931423492103944];
            map.setCenter(coordinates);

            // Add a marker for the selected place
            olaMaps
                .addMarker({
                    offset: [0, -10],
                    anchor: 'bottom',
                })
                .setLngLat(coordinates)
                .addTo(map);

            console.log(`Selected Place: ${place.name}, Coordinates: ${coordinates}`);
        })
        .catch(error => {
            console.error('Error fetching place details:', error);
        });

    // Clear the autocomplete results
    document.getElementById('autocomplete-results').innerHTML = '';
};

// Debounce function to limit API calls while typing
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};

// Attach debounced fetchAutocomplete to the input field
document.getElementById('place').addEventListener('input', debounce(fetchAutocomplete, 300));

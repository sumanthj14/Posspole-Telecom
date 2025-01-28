// Replace 'YOUR_API_KEY' with your actual OLA Maps API Key
const OLA_MAPS_API_KEY = '9Rzw286fzn0tFObFjok4qZlaICuZM0nbUjqe09mN';
const REQUEST_ID = 'unique-request-id'; // Replace with a unique request ID

// Initialize the OlaMaps instance
const olaMaps = new OlaMaps({
    apiKey: OLA_MAPS_API_KEY, // Pass your API key
});

// Initialize and render the map with Bangalore as the initial view
const map = olaMaps.init({
    style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
    container: 'map',
    center: [77.5946, 12.9716], // Center to Bangalore
    zoom: 12, // Set initial zoom level for Bangalore
});

// Functionality: Search by Latitude and Longitude
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

// CSV File Handling
const triggerFileUpload = () => {
    document.getElementById('csvFileInput').click();
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvData = e.target.result;
            const parsedData = parseCSV(csvData);
            renderMarkersFromCSV(parsedData); // Ensure this function is properly defined below
        };
        reader.readAsText(file);
    } else {
        alert('No file selected!');
    }
};

// Parse CSV data
const parseCSV = (data) => {
    const rows = data.split('\n');
    const parsedData = [];

    rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row
        const cols = row.split(',');

        const lat = parseFloat(cols[7]?.trim()); // Latitude column
        const long = parseFloat(cols[8]?.trim()); // Longitude column
        const phase = cols[6]?.trim(); // Phase column
        const district = cols[2]?.trim(); // District column
        const block = cols[3]?.trim(); // Block column

        if (!isNaN(lat) && !isNaN(long)) {
            parsedData.push({ lat, long, phase, district, block });
        }
    });

    return parsedData;
};

// Determine marker color based on phase
const getMarkerColor = (phase) => {
    switch (phase?.toLowerCase()) {
        case 'phase-1':
            return '#1E90FF'; // Blue
        case 'phase-2':
            return '#FF4500'; // Red
        case 'newly created':
            return '#32CD32'; // Green
        default:
            return '#808080'; // Default Gray
    }
};

// Render markers from CSV data
const renderMarkersFromCSV = (data) => {
    data.forEach((location) => {
        const markerColor = getMarkerColor(location.phase);

        try {
            const marker = olaMaps
                .addMarker({
                    offset: [0, -10],
                    anchor: 'bottom',
                    color: markerColor, // Use color-based marker
                })
                .setLngLat([location.long, location.lat])
                .addTo(map);

            const popup = olaMaps
                .addPopup({ offset: [0, -20], anchor: 'bottom' })
                .setHTML(`
                    <div>
                        <p><strong>District:</strong> ${location.district || 'Unknown'}</p>
                        <p><strong>Block:</strong> ${location.block || 'Unknown'}</p>
                        <p><strong>Phase:</strong> ${location.phase || 'Unknown'}</p>
                        <p><strong>Coordinates:</strong> (${location.lat}, ${location.long})</p>
                    </div>
                `);

            marker.setPopup(popup);
        } catch (error) {
            console.error(`Failed to add marker for ${location}`, error);
        }
    });

    console.log(`Added ${data.length} markers to the map.`);

    // Zoom and center the map over Punjab
    map.fitBounds(
        [
            [73.878, 29.694], // Southwest corner of Punjab
            [76.938, 32.589], // Northeast corner of Punjab
        ],
        { padding: 50 } // Padding around bounds
    );
};

// Fetch and display the user's current location
const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Re-center the map
                map.setCenter([longitude, latitude]);
                map.setZoom(14); // Zoom closer to the user's location

                // Add a marker at the current location
                const marker = olaMaps
                    .addMarker({
                        offset: [0, -10],
                        anchor: 'bottom',
                        color: '#FF6347', // Tomato color for current location marker
                    })
                    .setLngLat([longitude, latitude])
                    .addTo(map);

                console.log(`Current Location: Latitude ${latitude}, Longitude ${longitude}`);
            },
            (error) => {
                alert('Unable to fetch current location. Please check your browser settings.');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
};

// Autocomplete Search Functionality
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
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const results = data.predictions || []; // Adjust based on the API response
            displayAutocompleteResults(results);
        })
        .catch((error) => {
            console.error('Error fetching autocomplete results:', error);
        });
};

// Display autocomplete suggestions in the dropdown
const displayAutocompleteResults = (results) => {
    const autocompleteList = document.getElementById('autocomplete-results');
    autocompleteList.innerHTML = ''; // Clear previous results

    results.forEach((result) => {
        const listItem = document.createElement('li');
        listItem.textContent = result.description; // Display the suggestion name
        listItem.onclick = () => {
            handleAutocompleteSelection(result.place_id); // Handle selection when clicked
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
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const place = data.result; // Extract place details
            const coordinates = place.geometry?.location || [77.5946, 12.9716]; // Fallback to Bangalore
            map.setCenter(coordinates); // Center map on selected place

            // Add a marker for the selected place
            olaMaps
                .addMarker({
                    offset: [0, -10],
                    anchor: 'bottom',
                    color: 'blue',
                })
                .setLngLat(coordinates)
                .addTo(map);

            console.log(`Selected Place: ${place.name}, Coordinates: ${coordinates}`);
        })
        .catch((error) => {
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

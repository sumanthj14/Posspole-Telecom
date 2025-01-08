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

// Add a marker at the initial center (Bangalore coordinates)
const initialMarker = olaMaps
    .addMarker({
        offset: [0, 0], // No offset
        anchor: [0.5, 1], // Anchor the bottom-center of the marker
        color: "blue", // Marker color
        draggable: false, // Marker is not draggable
    })
    .setLngLat([77.61648476788898, 12.931423492103944]) // Set marker coordinates
    .addTo(map); // Add marker to the map

console.log("Initial marker added at Bangalore coordinates: Latitude 12.931423492103944, Longitude 77.61648476788898.");


//     // Add a marker at the given location
//     const marker = olaMaps
//         .addMarker({
//             offset: [0, 0], // Ensure no offset
//             anchor: [0.5, 1], // Anchor the bottom-center of the marker
//             color: "red", // Marker color
//             draggable: true, // Allow the marker to be draggable
//         })
//         .setLngLat([parsedLon, parsedLat]) // Set marker position
//         .addTo(map); // Add marker to the map

//     // Create an info window (popup) for the marker
//     const popup = olaMaps
//         .addPopup({
//             offset: [0, -10], // Position the popup slightly above the marker
//         })
//         .setText(`Latitude: ${parsedLat}, Longitude: ${parsedLon}`); // Set popup text

//     // Bind the popup to the marker
//     marker.setPopup(popup);

//     // Event listener for marker drag (optional)
//     marker.on("drag", () => {
//         const lngLat = marker.getLngLat(); // Get marker's updated position
//         console.log(`Marker dragged to: Latitude ${lngLat.lat}, Longitude ${lngLat.lng}`);
//     });

//     console.log(`Marker added at Latitude: ${parsedLat}, Longitude: ${parsedLon}`);
// }

// // Debounce function to limit API requests during typing
// let debounceTimeout;
// function debounce(func, delay) {
//     clearTimeout(debounceTimeout);
//     debounceTimeout = setTimeout(func, delay);
// }

// // Function to fetch Autocomplete API results
// function fetchAutocomplete() {
//     const place = document.getElementById('place').value.trim();

//     if (place.length < 3) {
//         // Clear suggestions if input is less than 3 characters
//         document.getElementById('autocomplete-results').innerHTML = '';
//         return;
//     }

//     const autocompleteUrl = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(place)}&api_key=${OLA_MAPS_API_KEY}`;

//     fetch(autocompleteUrl, {
//         method: 'GET',
//         headers: {
//             "X-Request-Id": "unique-request-id",
//         },
//     })
//         .then(response => response.json())
//         .then(data => {
//             console.log("Autocomplete API Response:", data);

//             const results = data.predictions || [];
//             const resultsContainer = document.getElementById('autocomplete-results');
//             resultsContainer.innerHTML = ''; // Clear previous results

//             results.forEach(item => {
//                 const li = document.createElement('li');
//                 li.textContent = item.description;
//                 li.onclick = () => {
//                     document.getElementById('place').value = item.description;
//                     resultsContainer.innerHTML = ''; // Clear suggestions

//                     // Fetch coordinates for the selected place
//                     searchByPlace(item.description); // Trigger Text Search API
//                 };
//                 resultsContainer.appendChild(li);
//             });
//         })
//         .catch(err => {
//             console.error("Error fetching autocomplete results:", err);
//         });
// }


// // Function to search by place using Text Search API
// function searchByPlace(place = null) {
//     const query = place || document.getElementById('place').value.trim();

//     if (!query || query.length < 3) {
//         alert("Please enter a valid and descriptive query (e.g., 'cafes in Koramangala').");
//         return;
//     }

//     // Enhance query with default location context if it lacks specificity
//     const enhancedQuery = query.includes("in") ? query : `${query} in Bangalore`;

//     const textSearchUrl = `https://api.olamaps.io/places/v1/textsearch?input=${encodeURIComponent(enhancedQuery)}&api_key=${OLA_MAPS_API_KEY}`;

//     console.log("Text Search Query:", enhancedQuery);
//     console.log("Text Search API URL:", textSearchUrl);

//     fetch(textSearchUrl, {
//         method: 'GET',
//         headers: {
//             "X-Request-Id": "unique-request-id", // Optional header for request tracking
//         },
//     })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log("Text Search API Response:", data);

//             if (data.status === "zero_results" || !data.predictions || data.predictions.length === 0) {
//                 const message = data.info_messages ? data.info_messages[0] : "No results found.";
//                 alert(`No results: ${message}\nPlease refine your query (e.g., 'cafes in Koramangala').`);
//                 return;
//             }

//             // Iterate through all predictions and add markers
//             data.predictions.forEach((result, index) => {
//                 const name = result.name;
//                 const lat = result.geometry.location.lat;
//                 const lon = result.geometry.location.lng;

//                 console.log(`Result ${index + 1}: ${name}, Latitude: ${lat}, Longitude: ${lon}`);

//                 // Add marker for each result
//                 const marker = olaMaps
//                     .addMarker({
//                         offset: [0, 0], // No offset
//                         anchor: [0.5, 1], // Anchor point
//                         color: index === 0 ? "red" : "blue", // Red for the first result, blue for others
//                         draggable: false, // Marker is not draggable
//                     })
//                     .setLngLat([lon, lat]) // Set marker coordinates
//                     .addTo(map); // Add marker to the map

//                 // Add popup to each marker
//                 const popup = olaMaps
//                     .addPopup({
//                         offset: [0, -10], // Offset the popup slightly above the marker
//                     })
//                     .setText(`${name}\nLat: ${lat}, Lon: ${lon}`);

//                 // Bind the popup to the marker
//                 marker.setPopup(popup);
//             });

//             // Center the map on the first result
//             const firstResult = data.predictions[0];
//             map.setCenter([firstResult.geometry.location.lng, firstResult.geometry.location.lat]);
//             map.setZoom(15); // Adjust zoom level for better view
//         })
//         .catch(err => {
//             console.error("Error fetching place data:", err);
//             alert("An error occurred while searching for the place. Please try again.");
//         });
// }





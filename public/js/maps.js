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
    zoom: 10, // Initial zoom level
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

// Fetch autocomplete suggestions
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
        .then(response => response.json())
        .then(data => {
            const results = data.predictions || [];
            displayAutocompleteResults(results);
        })
        .catch(error => {
            console.error('Error fetching autocomplete results:', error);
        });
};

// Display autocomplete suggestions
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

// Handle the selection of a place
const handleAutocompleteSelection = (placeId) => {
    const url = `https://api.olamaps.io/places/v1/details?place_id=${placeId}&api_key=${OLA_MAPS_API_KEY}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'X-Request-Id': REQUEST_ID,
        },
    })
        .then(response => response.json())
        .then(data => {
            const place = data.result;
            const coordinates = place.geometry?.location || [77.61648476788898, 12.931423492103944];

            // Re-center and zoom the map
            map.setCenter(coordinates);
            map.setZoom(15); // Zoom level for closer focus

            // Add a marker for the selected place
            const marker = olaMaps
                .addMarker({
                    offset: [0, -10],
                    anchor: 'bottom',
                    color: 'blue',
                })
                .setLngLat(coordinates)
                .addTo(map);

            // Attach a click event to the marker to display a dialog with details
            marker.getElement().addEventListener('click', () => {
                showPlaceDetailsDialog(place);
            });

            console.log(`Selected Place: ${place.name}, Coordinates: ${coordinates}`);
        })
        .catch(error => {
            console.error('Error fetching place details:', error);
        });

    // Clear autocomplete results
    document.getElementById('autocomplete-results').innerHTML = '';
};

// Show place details in a dialog box
const showPlaceDetailsDialog = (place) => {
    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <h3>${place.name}</h3>
            <p>${place.formatted_address}</p>
            <p>${place.types?.join(', ') || 'No additional details available.'}</p>
            <button onclick="closeDialog()">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);
};

// Close the dialog box
const closeDialog = () => {
    const dialog = document.querySelector('.dialog');
    if (dialog) {
        dialog.remove();
    }
};

// Debounce function for autocomplete
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};

// Attach debounced autocomplete to input
document.getElementById('place').addEventListener('input', debounce(fetchAutocomplete, 300));

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
            renderMarkersFromCSV(parsedData);
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

// Create a styled marker element
const createSVGIcon = (color) => {
    const div = document.createElement('div');
    div.style.width = '20px';
    div.style.height = '20px';
    div.style.backgroundColor = color;
    div.style.borderRadius = '50%';
    div.style.border = '2px solid white';
    return div;
};

// Render markers from CSV data
const renderMarkersFromCSV = (data) => {
    data.forEach((location) => {
        const markerColor = getMarkerColor(location.phase);
        const svgIcon = createSVGIcon(markerColor);

        try {
            const marker = olaMaps
                .addMarker({
                    element: svgIcon, // Use styled div as the marker
                    offset: [0, -10],
                    anchor: 'bottom',
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




// // Replace 'YOUR_API_KEY' with your actual OLA Maps API Key
// const OLA_MAPS_API_KEY = '9Rzw286fzn0tFObFjok4qZlaICuZM0nbUjqe09mN';
// const REQUEST_ID = 'unique-request-id'; // Replace with a unique request ID

// // Initialize the OlaMaps instance
// const olaMaps = new OlaMaps({
//     apiKey: OLA_MAPS_API_KEY, // Pass your API key
// });

// // Initialize and render the map
// const map = olaMaps.init({
//     style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
//     container: 'map',
//     center: [77.61648476788898, 12.931423492103944], // Default to Bangalore
//     zoom: 10, // Initial zoom level
// });

// // Functionality: Search by Latitude and Longitude
// const searchByLatLon = () => {
//     const latInput = document.getElementById('latitude').value;
//     const lonInput = document.getElementById('longitude').value;

//     if (!latInput || !lonInput || isNaN(latInput) || isNaN(lonInput)) {
//         alert('Please enter valid Latitude and Longitude values.');
//         return;
//     }

//     const latitude = parseFloat(latInput);
//     const longitude = parseFloat(lonInput);

//     // Re-center the map
//     map.setCenter([longitude, latitude]);

//     // Add a marker at the specified coordinates
//     const marker = olaMaps
//         .addMarker({
//             offset: [0, -10],
//             anchor: 'bottom',
//             color: 'blue',
//         })
//         .setLngLat([longitude, latitude])
//         .addTo(map);

//     console.log(`Marker added at Latitude: ${latitude}, Longitude: ${longitude}`);
// };

// // Fetch autocomplete suggestions
// const fetchAutocomplete = () => {
//     const query = document.getElementById('place').value.trim();
//     if (!query) return;

//     const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(query)}&api_key=${OLA_MAPS_API_KEY}`;

//     fetch(url, {
//         method: 'GET',
//         headers: {
//             'X-Request-Id': REQUEST_ID,
//         },
//     })
//         .then(response => response.json())
//         .then(data => {
//             const results = data.predictions || [];
//             displayAutocompleteResults(results);
//         })
//         .catch(error => {
//             console.error('Error fetching autocomplete results:', error);
//         });
// };

// // Display autocomplete suggestions
// const displayAutocompleteResults = (results) => {
//     const autocompleteList = document.getElementById('autocomplete-results');
//     autocompleteList.innerHTML = '';

//     results.forEach((result) => {
//         const listItem = document.createElement('li');
//         listItem.textContent = result.description;
//         listItem.onclick = () => {
//             handleAutocompleteSelection(result.place_id);
//         };
//         autocompleteList.appendChild(listItem);
//     });
// };

// // Handle the selection of a place
// const handleAutocompleteSelection = (placeId) => {
//     const url = `https://api.olamaps.io/places/v1/details?place_id=${placeId}&api_key=${OLA_MAPS_API_KEY}`;

//     fetch(url, {
//         method: 'GET',
//         headers: {
//             'X-Request-Id': REQUEST_ID,
//         },
//     })
//         .then(response => response.json())
//         .then(data => {
//             const place = data.result;
//             const coordinates = place.geometry?.location || [77.61648476788898, 12.931423492103944];

//             // Re-center and zoom the map
//             map.setCenter(coordinates);
//             map.setZoom(15); // Zoom level for closer focus

//             // Add a marker for the selected place
//             const marker = olaMaps
//                 .addMarker({
//                     offset: [0, -10],
//                     anchor: 'bottom',
//                     color: 'blue',
//                 })
//                 .setLngLat(coordinates)
//                 .addTo(map);

//             // Attach a click event to the marker to display a dialog with details
//             marker.getElement().addEventListener('click', () => {
//                 showPlaceDetailsDialog(place);
//             });

//             console.log(`Selected Place: ${place.name}, Coordinates: ${coordinates}`);
//         })
//         .catch(error => {
//             console.error('Error fetching place details:', error);
//         });

//     // Clear autocomplete results
//     document.getElementById('autocomplete-results').innerHTML = '';
// };

// // Show place details in a dialog box
// const showPlaceDetailsDialog = (place) => {
//     const dialog = document.createElement('div');
//     dialog.className = 'dialog';
//     dialog.innerHTML = `
//         <div class="dialog-content">
//             <h3>${place.name}</h3>
//             <p>${place.formatted_address}</p>
//             <p>${place.types?.join(', ') || 'No additional details available.'}</p>
//             <button onclick="closeDialog()">Close</button>
//         </div>
//     `;
//     document.body.appendChild(dialog);
// };

// // Close the dialog box
// const closeDialog = () => {
//     const dialog = document.querySelector('.dialog');
//     if (dialog) {
//         dialog.remove();
//     }
// };

// // Debounce function for autocomplete
// const debounce = (func, delay) => {
//     let timeout;
//     return (...args) => {
//         clearTimeout(timeout);
//         timeout = setTimeout(() => func.apply(this, args), delay);
//     };
// };

// // Attach debounced autocomplete to input
// document.getElementById('place').addEventListener('input', debounce(fetchAutocomplete, 300));

// // CSV File Handling
// const triggerFileUpload = () => {
//     document.getElementById('csvFileInput').click();
// };

// const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             const csvData = e.target.result;
//             const parsedData = parseCSV(csvData);
//             renderMarkersFromCSV(parsedData);
//         };
//         reader.readAsText(file);
//     } else {
//         alert('No file selected!');
//     }
// };

// // Parse CSV data
// const parseCSV = (data) => {
//     const rows = data.split('\n');
//     const parsedData = [];

//     rows.forEach((row, index) => {
//         if (index === 0) return; // Skip header row
//         const cols = row.split(',');

//         const lat = parseFloat(cols[7]?.trim()); // Latitude column
//         const long = parseFloat(cols[8]?.trim()); // Longitude column
//         const phase = cols[6]?.trim(); // Phase column
//         const district = cols[2]?.trim(); // District column
//         const block = cols[3]?.trim(); // Block column

//         if (!isNaN(lat) && !isNaN(long)) {
//             parsedData.push({ lat, long, phase, district, block });
//         }
//     });

//     return parsedData;
// };

// // Determine marker color based on phase
// const getMarkerColor = (phase) => {
//     switch (phase?.toLowerCase()) {
//         case 'phase-1':
//             return 'blue';
//         case 'phase-2':
//             return 'red';
//         case 'newly created':
//             return 'green';
//         default:
//             return 'gray'; // Default marker color
//     }
// };

// // Render markers from CSV data
// const renderMarkersFromCSV = (data) => {
//     data.forEach((location) => {
//         const markerColor = getMarkerColor(location.phase);

//         const marker = olaMaps
//             .addMarker({
//                 offset: [0, -10],
//                 anchor: 'bottom',
//                 color: markerColor,
//             })
//             .setLngLat([location.long, location.lat])
//             .addTo(map);

//         const popup = olaMaps
//             .addPopup({ offset: [0, -20], anchor: 'bottom' })
//             .setHTML(`
//                 <div>
//                     <p><strong>District:</strong> ${location.district || 'Unknown'}</p>
//                     <p><strong>Block:</strong> ${location.block || 'Unknown'}</p>
//                     <p><strong>Phase:</strong> ${location.phase || 'Unknown'}</p>
//                     <p><strong>Coordinates:</strong> (${location.lat}, ${location.long})</p>
//                 </div>
//             `);

//         marker.setPopup(popup);
//     });

//     console.log(`Added ${data.length} markers to the map.`);

//     // Zoom and center the map over Punjab
//     map.fitBounds(
//         [
//             [73.878, 29.694], // Southwest corner of Punjab
//             [76.938, 32.589], // Northeast corner of Punjab
//         ],
//         { padding: 50 } // Padding around bounds
//     );
// };




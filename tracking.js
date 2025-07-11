/**
 * Google Maps Location Detector for Bharat Yatra - Real-time Version
 * This script provides real-time location tracking with:
 * 1. Current address display
 * 2. City, state, and country information
 * 3. Nearby places with ratings
 * 4. Smooth UI updates
 */

// Google Maps API Key
const API_KEY = "AIzaSyCw5662AJMRVhiMS0b5SmbEYfjiH6JlUqc";

// Global variables
let map;
let marker;
let infoWindow;
let placesService;
let geocoder;
let mapInitialized = false;
let lastPosition = null;
let watchPositionId = null;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // First check if Google Maps API is already loaded
    if (typeof google !== 'undefined' && google.maps) {
        initMap();
    } else {
        loadGoogleMaps();
    }
    
    // Set up event listeners
    document.getElementById('refreshLocation').addEventListener('click', refreshLocation);
    
    // Initialize UI state
    resetLocationUI();
});

// Load Google Maps script with API key
function loadGoogleMaps() {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = function() {
        showAlert('Failed to load Google Maps. Please check your internet connection and API key.', 'error');
    };
    document.head.appendChild(script);
}

// Initialize the map
function initMap() {
    try {
        // Default to India coordinates
        const india = { lat: 20.5937, lng: 78.9629 };
        
        map = new google.maps.Map(document.getElementById("map"), {
            center: india,
            zoom: 5,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            gestureHandling: "cooperative",
            styles: [
                {
                    "featureType": "poi",
                    "elementType": "labels",
                    "stylers": [{ "visibility": "off" }]
                }
            ]
        });

        infoWindow = new google.maps.InfoWindow();
        geocoder = new google.maps.Geocoder();
        placesService = new google.maps.places.PlacesService(map);
        mapInitialized = true;

        console.log("Google Maps initialized successfully");
        
        // Try to get current location if permission was previously granted
        if (navigator.geolocation && localStorage.getItem('geoPermission') === 'granted') {
            refreshLocation();
        }
    } catch (error) {
        showAlert('Error initializing Google Maps. Please check your API key and try again.', 'error');
        console.error('Map initialization error:', error);
    }
}

// Reset all location UI fields to default
function resetLocationUI() {
    document.getElementById('visitorLocation').textContent = 'Click "Refresh Location" to detect your location';
    document.getElementById('visitorCity').textContent = '-';
    document.getElementById('visitorState').textContent = '-';
    document.getElementById('visitorCountry').textContent = '-';
    document.getElementById('nearbyPlaces').innerHTML = '<p>Location data will appear here</p>';
}

// Refresh location - main function called when button is clicked
function refreshLocation() {
    if (!mapInitialized) {
        showAlert('Map is not ready yet. Please wait...', 'warning');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    // Stop any existing watchPosition
    if (watchPositionId) {
        navigator.geolocation.clearWatch(watchPositionId);
        watchPositionId = null;
    }
    
    getCurrentLocation();
}

// Set loading state for UI elements
function setLoadingState(isLoading) {
    const refreshBtn = document.getElementById('refreshLocation');
    
    if (isLoading) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';
        document.getElementById('visitorLocation').textContent = 'Detecting your location...';
        document.getElementById('visitorCity').textContent = 'Loading...';
        document.getElementById('visitorState').textContent = 'Loading...';
        document.getElementById('visitorCountry').textContent = 'Loading...';
        document.getElementById('nearbyPlaces').innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Loading nearby places...</p>';
    } else {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh Location';
    }
}

// Get current location using browser geolocation
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showAlert('Geolocation is not supported by your browser', 'error');
        setLoadingState(false);
        resetLocationUI();
        return;
    }
    
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };
    
    // First try to get immediate position
    navigator.geolocation.getCurrentPosition(
        function(position) {
            handlePositionSuccess(position);
            // Then start watching for position updates
            watchPositionId = navigator.geolocation.watchPosition(
                handlePositionSuccess,
                handlePositionError,
                options
            );
        },
        handlePositionError,
        options
    );
}

function handlePositionSuccess(position) {
    const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    
    // Store permission and position
    localStorage.setItem('geoPermission', 'granted');
    lastPosition = pos;
    
    // Update map and info
    updateMapAndLocationInfo(pos);
    setLoadingState(false);
}

function handlePositionError(error) {
    setLoadingState(false);
    handleLocationError(error);
    
    // If we have a last known position, use that
    if (lastPosition) {
        showAlert("Using last known location because:", 'warning');
        updateMapAndLocationInfo(lastPosition);
    }
}

// Update map and location information
function updateMapAndLocationInfo(pos) {
    centerMapOnLocation(pos);
    createLocationMarker(pos);
    updateLocationDetails(pos);
    getNearbyPlaces(pos);
}

// Center map on given position
function centerMapOnLocation(pos) {
    if (!mapInitialized) return;
    
    map.setCenter(pos);
    map.setZoom(14);
}

// Create marker for current location
function createLocationMarker(pos) {
    if (!mapInitialized) return;
    
    // Remove existing marker if any
    if (marker) {
        marker.setMap(null);
    }

    marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: "Your Location",
        icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new google.maps.Size(40, 40)
        },
        animation: google.maps.Animation.DROP
    });

    // Add click event to marker
    marker.addListener('click', function() {
        infoWindow.setContent(`
            <div class="location-info">
                <h3>Your Current Location</h3>
                <p>Latitude: ${pos.lat.toFixed(6)}</p>
                <p>Longitude: ${pos.lng.toFixed(6)}</p>
            </div>
        `);
        infoWindow.open(map, marker);
    });
}

// Update location details using reverse geocoding
function updateLocationDetails(pos) {
    if (!geocoder) return;
    
    geocoder.geocode({ location: pos }, function(results, status) {
        if (status === "OK" && results[0]) {
            const address = results[0];
            const addressComponents = parseAddressComponents(results[0].address_components);
            
            // Update UI with location details
            updateLocationUI(
                address.formatted_address,
                addressComponents.city || addressComponents.locality || 'Not available',
                addressComponents.state || 'Not available',
                addressComponents.country || 'Not available'
            );
            
            // Special handling for India
            if (addressComponents.country !== 'India') {
                showAlert('Note: This feature is optimized for Indian locations', 'info');
            }
        } else {
            updateLocationUI('Address not found', '-', '-', '-');
            console.error('Geocoder failed:', status);
        }
    });
}

// Enhanced address component parser
function parseAddressComponents(components) {
    const address = {
        city: '',
        locality: '',
        state: '',
        country: ''
    };
    
    components.forEach(component => {
        if (component.types.includes('locality')) {
            address.locality = component.long_name;
        }
        if (component.types.includes('administrative_area_level_2')) {
            address.city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
            address.state = component.long_name;
        }
        if (component.types.includes('country')) {
            address.country = component.long_name;
        }
        if (component.types.includes('postal_town') && !address.city) {
            address.city = component.long_name;
        }
        if (component.types.includes('sublocality_level_1') && !address.locality) {
            address.locality = component.long_name;
        }
    });
    
    // Fallback to locality if city not found
    if (!address.city && address.locality) {
        address.city = address.locality;
    }
    
    return address;
}

// Get nearby points of interest
function getNearbyPlaces(pos) {
    if (!placesService || !mapInitialized) return;
    
    const request = {
        location: pos,
        radius: '1000',
        type: ['tourist_attraction', 'park', 'museum', 'shopping_mall', 'restaurant', 'cafe'],
        rankBy: google.maps.places.RankBy.PROMINENCE
    };

    placesService.nearbySearch(request, function(results, status) {
        const nearbyPlacesElement = document.getElementById('nearbyPlaces');
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            displayNearbyPlaces(results.slice(0, 5));
            addPlaceMarkers(results.slice(0, 5));
        } else {
            nearbyPlacesElement.innerHTML = '<p>No notable places found nearby</p>';
        }
    });
}

// Add markers for nearby places
function addPlaceMarkers(places) {
    if (window.placeMarkers) {
        window.placeMarkers.forEach(marker => marker.setMap(null));
    }
    
    window.placeMarkers = [];
    
    places.forEach(place => {
        if (!place.geometry || !place.geometry.location) return;
        
        const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
            }
        });
        
        marker.addListener('click', function() {
            infoWindow.setContent(`
                <div class="place-info-window">
                    <h3>${place.name}</h3>
                    ${place.vicinity ? `<p>${place.vicinity}</p>` : ''}
                    ${place.rating ? `<p>Rating: ${place.rating} (${place.user_ratings_total || '?'} reviews)</p>` : ''}
                </div>
            `);
            infoWindow.open(map, marker);
        });
        
        window.placeMarkers.push(marker);
    });
}

// Display nearby places in the UI
function displayNearbyPlaces(places) {
    const nearbyPlacesElement = document.getElementById('nearbyPlaces');
    if (!nearbyPlacesElement) return;
    
    nearbyPlacesElement.innerHTML = '';
    
    if (places.length === 0) {
        nearbyPlacesElement.innerHTML = '<p>No notable places found nearby</p>';
        return;
    }
    
    const placesList = document.createElement('ul');
    placesList.className = 'places-list';
    
    places.forEach(place => {
        const placeItem = document.createElement('li');
        placeItem.className = 'place-item';
        placeItem.innerHTML = `
            <div class="place-content">
                <i class="fas fa-map-marker-alt place-icon"></i>
                <div class="place-details">
                    <strong class="place-name">${place.name || 'Unknown place'}</strong>
                    ${place.vicinity ? `<div class="place-address">${place.vicinity}</div>` : ''}
                    ${place.rating ? `
                    <div class="place-rating">
                        <span class="stars">${getStarRating(place.rating)}</span>
                        ${place.user_ratings_total ? `<span class="review-count">(${place.user_ratings_total})</span>` : ''}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        placesList.appendChild(placeItem);
    });
    
    nearbyPlacesElement.appendChild(placesList);
}

// Helper function to create star rating display
function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return '★'.repeat(fullStars) + '½'.repeat(halfStar) + '☆'.repeat(emptyStars);
}

// Handle geolocation errors
function handleLocationError(error) {
    let errorMessage = "Error getting your location";
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = "Location request denied. Please enable location permissions in your browser settings.";
            localStorage.setItem('geoPermission', 'denied');
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is currently unavailable. Please check your network connection.";
            break;
        case error.TIMEOUT:
            errorMessage = "The request to get your location timed out. Please try again.";
            break;
        case error.UNKNOWN_ERROR:
            errorMessage = "An unknown error occurred while getting your location.";
            break;
    }
    
    showAlert(errorMessage, 'error');
    console.error('Geolocation error:', error);
}

// Update location UI elements
function updateLocationUI(location, city, state, country) {
    const locationElement = document.getElementById('visitorLocation');
    const cityElement = document.getElementById('visitorCity');
    const stateElement = document.getElementById('visitorState');
    const countryElement = document.getElementById('visitorCountry');
    
    if (locationElement) locationElement.textContent = location || 'Not available';
    if (cityElement) cityElement.textContent = city || 'Not available';
    if (stateElement) stateElement.textContent = state || 'Not available';
    if (countryElement) countryElement.textContent = country || 'Not available';
}

// Show alert message
function showAlert(message, type = 'info') {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alertBox = document.createElement('div');
    alertBox.className = `alert alert-${type}`;
    alertBox.innerHTML = `
        <div class="alert-content">
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(alertBox);
    
    setTimeout(() => {
        alertBox.classList.add('fade-out');
        setTimeout(() => {
            alertBox.remove();
        }, 500);
    }, 5000);
}

// Make initMap available globally for Google Maps callback
window.initMap = initMap;
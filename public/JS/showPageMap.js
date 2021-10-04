mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 8 // starting zoom
});

new mapboxgl.Marker()
    // this sets the Lng and LAT for the location.
    .setLngLat(campground.geometry.coordinates)
    // This sets a popup when you click on the location that tells you the campground title.
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${campground.title}</h3><p>${campground.location}</p>`
        )
    )
    .addTo(map);

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const apiUrl = 'https://api.openrouteservice.org/v2/directions/driving-car?start=51.4133,35.7235&end=51.6650002,32.6707877';

fetch(proxyUrl + apiUrl)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('Service Worker registration failed:', err));
}


// مقداردهی نقشه
const map = L.map('map').setView([35.6892, 51.3890], 12);

// افزودن لایه نقشه از OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const geocoder = L.Control.geocoder().addTo(map);
L.control.scale().addTo(map);
// بارگذاری داده‌های GeoJSON
fetch('./data.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('مشکلی در بارگذاری فایل GeoJSON وجود دارد.');
        }
        return response.json();
    })
    .then(geojsonData => {
        const geoJsonLayer = L.geoJSON(geojsonData, {
            onEachFeature: (feature, layer) => {
                layer.bindPopup(
                    `<h3>${feature.properties.name}</h3><p>${feature.properties.description}</p>`
                );
            }
        }).addTo(map);

        // جستجو در داده‌های GeoJSON
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase();
            geoJsonLayer.eachLayer(layer => {
                if (
                    layer.feature.properties.name.toLowerCase().includes(query) ||
                    layer.feature.properties.description.toLowerCase().includes(query)
                ) {
                    layer.setStyle({ opacity: 1, fillOpacity: 0.8 });
                    layer.openPopup();
                } else {
                    layer.setStyle({ opacity: 0, fillOpacity: 0 });
                    layer.closePopup();
                }
            });
        });
    })
    .catch(error => console.error('خطا:', error));


// 2. تعریف لایه‌ها
const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">Esri</a>'
});

// 3. اضافه کردن لایه‌های پایه به نقشه
streetLayer.addTo(map); // لایه خیابانی به نقشه اضافه می‌شود

// 4. کنترل لایه‌ها (خیابانی، ماهواره‌ای)
const baseLayers = {
    "Street View": streetLayer,
    "Satellite View": satelliteLayer
};

L.control.layers(baseLayers).addTo(map); // به نقشه کنترل لایه‌ها اضافه می‌شود



// 3. تعریف یک متغیر برای لایه GeoJSON
// بارگذاری GeoJSON
let geoJsonLayer;

fetch('./data.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('مشکلی در بارگذاری فایل GeoJSON وجود دارد.');
        }
        return response.json();
    })
    .then(geojsonData => {
        geoJsonLayer = L.geoJSON(geojsonData, {
            onEachFeature: (feature, layer) => {
                layer.bindPopup(
                    `<h3>${feature.properties.name}</h3><p>${feature.properties.description}</p>`
                );
            }
        }).addTo(map);

        // جستجو در داده‌های GeoJSON
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase();
            geoJsonLayer.eachLayer(layer => {
                if (
                    layer.feature.properties.name.toLowerCase().includes(query) ||
                    layer.feature.properties.description.toLowerCase().includes(query)
                ) {
                    layer.setStyle({ opacity: 1, fillOpacity: 0.8 });
                    layer.openPopup();
                } else {
                    layer.setStyle({ opacity: 0, fillOpacity: 0 });
                    layer.closePopup();
                }
            });
        });
    })
    .catch(error => console.error('خطا:', error));



// افزودن دکمه موقعیت فعلی
document.getElementById('locate-btn').addEventListener('click', function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const userMarker = L.marker([lat, lon]).addTo(map)
                .bindPopup('You are Here!')
                .openPopup();
            map.setView([lat, lon], 15); // زوم بر روی موقعیت کاربر
        }, function () {
            alert('خطا در دریافت موقعیت فعلی.');
        });
    } else {
        alert('Geolocation در این مرورگر پشتیبانی نمی‌شود.');
    }
});



// داده‌های GeoJSON نمونه
const geojsonData = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [51.3890, 35.6892] // مختصات تهران
            },
            "properties": {
                "name": "تهران"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [51.6650, 32.6707] // مختصات یزد
            },
            "properties": {
                "name": "یزد"
            }
        }
        // می‌توانید داده‌های بیشتری اضافه کنید
    ]
};

// تابع برای محاسبه فاصله بین دو نقطه
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // شعاع زمین به کیلومتر
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // فاصله به کیلومتر
}

// فیلتر کردن داده‌های GeoJSON
function filterGeoJSON(geojsonData, userLat, userLon, radius) {
    const filteredFeatures = geojsonData.features.filter(feature => {
        const [lon, lat] = feature.geometry.coordinates; // مختصات ویژگی
        const distance = haversine(userLat, userLon, lat, lon);
        return distance <= radius; // بررسی فاصله
    });
    return {
        type: "FeatureCollection",
        features: filteredFeatures
    };
}


// نمایش داده‌ها روی نقشه
function displayData(data, userLat, userLon, radius) {
    L.geoJSON(data).addTo(map);

    // اضافه کردن دایره به نقشه
    L.circle([userLat, userLon], {
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.5,
        radius: radius * 1000 // تبدیل کیلومتر به متر
    }).addTo(map);
}

// فیلتر کردن داده‌ها با کلیک روی دکمه
document.getElementById('filter-button').addEventListener('click', () => {
    userLat = parseFloat(document.getElementById('latitude').value);
    userLon = parseFloat(document.getElementById('longitude').value);
    radius = parseFloat(document.getElementById('radius').value);

    filteredData = filterGeoJSON(geojsonData, userLat, userLon, radius);
    map.eachLayer(layer => {
        if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer); // حذف لایه‌های قبلی
        } else if (layer instanceof L.Circle) {
            map.removeLayer(layer); // حذف دایره‌های قبلی
        }
    });
    displayData(filteredData, userLat, userLon, radius); // نمایش داده‌های فیلترشده و دایره
});




let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // جلوگیری از نمایش پیش‌فرض نصب
    e.preventDefault();
    deferredPrompt = e;

    // نمایش دکمه نصب
    installButton = document.getElementById('install-btn');
    installButton.style.display = 'block';

    // زمانی که کاربر روی دکمه نصب کلیک می‌کند
    installButton.addEventListener('click', () => {
        // نمایش دیالوگ نصب
        deferredPrompt.prompt();

        // بررسی انتخاب کاربر
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
    });
});

measureControl = new L.Control.Measure({
    position: 'topleft',
    primaryLengthUnit: 'meters',
    secondaryLengthUnit: 'kilometers'
}).addTo(map);



minimap = new L.Control.MiniMap(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'), {
    toggleDisplay: true
}).addTo(map);



document.getElementById('calculate-route').addEventListener('click', function () {
    // خواندن مقادیر ورودی
    startPoint = document.getElementById('start').value.trim();
    endPoint = document.getElementById('end').value.trim();

    // تبدیل مختصات به آرایه [latitude, longitude]
    startLatLng = parseLatLng(startPoint);
    endLatLng = parseLatLng(endPoint);

    // بررسی صحت ورودی‌ها
    if (!startLatLng || !endLatLng) {
        alert("مختصات وارد شده نامعتبر است. لطفاً به فرمت 'latitude,longitude' وارد کنید.");
        return;
    }

    // حذف مسیر قبلی (اگر وجود داشته باشد)
    if (map.hasLayer(route)) {
        map.removeLayer(route);
    }

    // ایجاد مسیر جدید
    route = L.Routing.control({
        waypoints: [
            L.latLng(startLatLng[0], startLatLng[1]),
            L.latLng(endLatLng[0], endLatLng[1])
        ],
        routeWhileDragging: true,
        fitSelectedRoutes: true // زوم به مسیر محاسبه شده
    }).addTo(map);
});

// تابع برای تجزیه مختصات ورودی به آرایه [latitude, longitude]
function parseLatLng(input) {
    parts = input.split(',').map(function (part) {
        return parseFloat(part.trim());
    });
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return parts;
    }
    return null;
}

L.control.fullscreen().addTo(map);

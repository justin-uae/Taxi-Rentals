import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { ZoomIn, ZoomOut, Maximize2, Layers, Car } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapViewProps } from '../../types';

// Fix leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

const createCustomIcon = (color: string, emoji: string) => {
    return L.divIcon({
        html: `
            <div style="
                position: relative;
                background-color: ${color};
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
            ">
                ${emoji}
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
        className: 'custom-marker'
    });
};

const MapControls: React.FC<{
    fromCoords: { lat: number; lng: number };
    toCoords: { lat: number; lng: number };
    mapType: 'streets' | 'satellite' | 'light';
    showTraffic: boolean;
    onMapTypeToggle: () => void;
    onTrafficToggle: () => void;
}> = ({ fromCoords, toCoords, showTraffic, onMapTypeToggle, onTrafficToggle }) => {
    const map = useMap();

    useEffect(() => {
        if (map) {
            const bounds = L.latLngBounds([fromCoords, toCoords]);
            map.fitBounds(bounds, { padding: [100, 100] });
        }
    }, [map, fromCoords, toCoords]);

    const handleZoomIn = () => map.zoomIn();
    const handleZoomOut = () => map.zoomOut();
    const handleFullView = () => {
        const bounds = L.latLngBounds([fromCoords, toCoords]);
        map.fitBounds(bounds, { padding: [100, 100] });
    };

    return (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1 sm:gap-2">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-1 sm:p-2 flex flex-col gap-1 sm:gap-2">
                <button
                    onClick={handleZoomIn}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    title="Zoom In"
                >
                    <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 group-hover:text-blue-600" />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    title="Zoom Out"
                >
                    <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 group-hover:text-blue-600" />
                </button>
                <button
                    onClick={handleFullView}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    title="Fit Route to View"
                >
                    <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 group-hover:text-green-600" />
                </button>
                <div className="h-px bg-gray-200 my-0.5 sm:my-1"></div>
                <button
                    onClick={onMapTypeToggle}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    title="Change Map Type"
                >
                    <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 group-hover:text-purple-600" />
                </button>
                <button
                    onClick={onTrafficToggle}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors group ${showTraffic ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}`}
                    title="Toggle Traffic"
                >
                    <Car className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
            </div>
        </div>
    );
};

const MapView: React.FC<MapViewProps> = ({ from, to, fromCoords, toCoords, selectedTaxiId }) => {
    const [mapType, setMapType] = useState<'streets' | 'satellite' | 'light'>('streets');
    const [showTraffic, setShowTraffic] = useState(true);
    const [mapReady, setMapReady] = useState(false);

    const pickupIcon = createCustomIcon('#10B981', '📍');
    const destinationIcon = createCustomIcon('#EF4444', '🏁');

    const calculateCurvedRoute = (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
        const midLat = (start.lat + end.lat) / 2;
        const midLng = (start.lng + end.lng) / 2;
        const offset = 0.01;
        const curvedLat = midLat + offset;
        const curvedLng = midLng - offset;

        return [
            [start.lat, start.lng],
            [curvedLat, curvedLng],
            [end.lat, end.lng]
        ] as [number, number][];
    };

    const routePolyline = calculateCurvedRoute(fromCoords, toCoords);

    const getTileLayerUrl = () => {
        switch (mapType) {
            case 'satellite':
                return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
            case 'light':
                return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
            default:
                return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        }
    };

    const toggleMapType = () => {
        const types: ('streets' | 'satellite' | 'light')[] = ['streets', 'satellite', 'light'];
        const nextIndex = (types.indexOf(mapType) + 1) % types.length;
        setMapType(types[nextIndex]);
    };

    const toggleTraffic = () => setShowTraffic(!showTraffic);

    return (
        <div className="h-full w-full relative rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200">
            {!mapReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 z-10">
                    <div className="text-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-[3px] border-blue-500 border-t-transparent mx-auto mb-3 sm:mb-4"></div>
                        <p className="text-gray-700 font-medium text-sm sm:text-base">Loading route map...</p>
                    </div>
                </div>
            )}

            <MapContainer
                center={[(fromCoords.lat + toCoords.lat) / 2, (fromCoords.lng + toCoords.lng) / 2]}
                zoom={12}
                className="h-full w-full"
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                whenReady={() => setMapReady(true)}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={getTileLayerUrl()}
                />

                {showTraffic && (
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                        opacity={0.3}
                    />
                )}

                <Marker position={fromCoords} icon={pickupIcon}>
                    <Popup className="custom-popup">
                        <div className="font-bold text-gray-900 mb-1">Pickup Location</div>
                        <div className="text-sm text-gray-700 mb-2">{from}</div>
                    </Popup>
                </Marker>

                <Marker position={toCoords} icon={destinationIcon}>
                    <Popup>
                        <div className="font-bold text-gray-900 mb-1">Destination</div>
                        <div className="text-sm text-gray-700 mb-2">{to}</div>
                    </Popup>
                </Marker>

                <Polyline
                    pathOptions={{
                        color: selectedTaxiId ? '#F97316' : '#3B82F6',
                        weight: 4,
                        opacity: 0.8,
                        lineCap: 'round',
                        dashArray: selectedTaxiId ? 'none' : '15, 10'
                    }}
                    positions={routePolyline}
                />

                <MapControls
                    fromCoords={fromCoords}
                    toCoords={toCoords}
                    mapType={mapType}
                    showTraffic={showTraffic}
                    onMapTypeToggle={toggleMapType}
                    onTrafficToggle={toggleTraffic}
                />
            </MapContainer>
        </div>
    );
};

export default MapView;
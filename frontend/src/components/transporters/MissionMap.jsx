import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { FaTruck, FaMapMarkerAlt, FaHome, FaClock, FaRoute, FaInfoCircle } from 'react-icons/fa';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for default marker icons in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Markers
const createCustomIcon = (IconComponent, color) => {
  const iconHtml = renderToStaticMarkup(
    <div style={{ color: color, fontSize: '24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
      <IconComponent />
    </div>
  );
  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

const farmerIcon = createCustomIcon(FaHome, '#10b981'); // Green
const buyerIcon = createCustomIcon(FaMapMarkerAlt, '#3b82f6'); // Blue
const truckIcon = createCustomIcon(FaTruck, '#ef4444'); // Red

// Routing Component
const Routing = ({ start, end, onRouteUpdate }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !start || !end) return;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      lineOptions: {
        styles: [{ color: '#10b981', weight: 6, opacity: 0.7 }]
      },
      createMarker: () => null, // We handle markers manually
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      })
    }).on('routesfound', (e) => {
      const routes = e.routes;
      const summary = routes[0].summary;
      onRouteUpdate({
        distance: (summary.totalDistance / 1000).toFixed(1), // km
        time: Math.round(summary.totalTime / 60) // minutes
      });
    }).addTo(map);

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, start, end]);

  return null;
};

// Map Controller for Auto-centering
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center]);
  return null;
};

const MissionMap = ({ mission, currentLoc }) => {
  const [routeInfo, setRouteInfo] = useState({ distance: '...', time: '...' });

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedLoc, setSimulatedLoc] = useState(null);
  const simInterval = useRef(null);

  const pickup = mission.farmer_lat && mission.farmer_lng 
    ? [mission.farmer_lat, mission.farmer_lng] 
    : null;
    
  const delivery = mission.delivery_latitude && mission.delivery_longitude 
    ? [mission.delivery_latitude, mission.delivery_longitude]
    : null;

  const destination = delivery || [36.720, 3.150];
  const origin = pickup || [36.730, 3.080];
  
  // Use simulated location if active, otherwise use prop or origin
  const transporterPos = isSimulating && simulatedLoc 
    ? [simulatedLoc.lat, simulatedLoc.lng]
    : (currentLoc ? [currentLoc.lat, currentLoc.lng] : origin);

  const startSimulation = () => {
    if (isSimulating) {
      clearInterval(simInterval.current);
      setIsSimulating(false);
      setSimulatedLoc(null);
      return;
    }

    setIsSimulating(true);
    let step = 0;
    const totalSteps = 100;
    
    simInterval.current = setInterval(() => {
      if (step > totalSteps) {
        clearInterval(simInterval.current);
        setIsSimulating(false);
        return;
      }
      
      const lat = origin[0] + (destination[0] - origin[0]) * (step / totalSteps);
      const lng = origin[1] + (destination[1] - origin[1]) * (step / totalSteps);
      setSimulatedLoc({ lat, lng });
      step++;
    }, 100);
  };

  useEffect(() => {
    return () => clearInterval(simInterval.current);
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 overflow-hidden">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <FaRoute size={20} />
          </div>
          <div>
            <h2 className="text-xl font-normal text-gray-800">Live Mission Tracking</h2>
            <p className="text-sm text-gray-500 font-normal">Current active delivery route and status</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  const { latitude, longitude } = pos.coords;
                  // If we have a local setter or just let the prop sync
                  console.log("Found you at:", latitude, longitude);
                });
              }
            }}
            className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-600 shadow-sm transition-all"
            title="Recenter to my location"
          >
            <FaMapMarkerAlt size={14} />
          </button>
          <button 
            onClick={startSimulation}
            className={`px-4 py-2 rounded-full text-xs font-normal transition-all border ${isSimulating ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'}`}
          >
            {isSimulating ? 'Stop Simulation' : 'Simulate Movement'}
          </button>
          {!currentLoc && !isSimulating && (
            <div className="flex items-center gap-2 text-orange-500 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 animate-strong-pulse shadow-sm">
              <FaInfoCircle size={14} />
              <span className="text-xs font-normal tracking-wide">Go Online to track location</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[450px] rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner group">
        <MapContainer
          center={transporterPos}
          zoom={13}
          className="w-full h-full z-10"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <ChangeView center={transporterPos} />
          
          <Marker position={origin} icon={farmerIcon}>
            <Popup>Pickup: {mission.farmer_name}</Popup>
          </Marker>

          <Marker position={destination} icon={buyerIcon}>
            <Popup>Delivery: {mission.buyer_name}</Popup>
          </Marker>

          {(currentLoc || isSimulating) && (
            <Marker position={transporterPos} icon={truckIcon}>
              <Popup>{isSimulating ? 'Simulation in progress' : 'You are here'}</Popup>
            </Marker>
          )}

          <Routing 
            start={mission.delivery_status === 'assigned' && !isSimulating ? origin : transporterPos} 
            end={destination} 
            onRouteUpdate={setRouteInfo} 
          />
        </MapContainer>

        {/* Floating Top Right Button (Similar to image) */}
        <div className="absolute top-6 right-6 z-20">
           <button className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors">
              <FaMapMarkerAlt size={20} />
           </button>
        </div>

        {/* Bottom Action Bar (The white stats bar from image) */}
        <div className="absolute bottom-6 left-6 right-6 z-20 px-4">
           <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <FaTruck size={22} />
                 </div>
                 <div>
                    <p className="text-[10px] text-gray-400 font-normal uppercase tracking-wider">Estimated Distance</p>
                    <p className="text-2xl font-normal text-gray-800 leading-none mt-1">
                      {routeInfo.distance} <span className="text-sm font-normal text-gray-400">km</span>
                    </p>
                 </div>
              </div>

              <div className="text-right">
                 <p className="text-[10px] text-gray-400 font-normal uppercase tracking-wider">Estimated Time</p>
                 <p className="text-2xl font-normal text-emerald-500 leading-none mt-1">
                   {routeInfo.time} <span className="text-sm font-normal opacity-60">min</span>
                 </p>
              </div>
           </div>
        </div>
      </div>

      <style jsx>{`
        .custom-leaflet-icon {
          background: transparent;
          border: none;
        }
        :global(.leaflet-control-zoom) {
          border: none !important;
          margin-top: 24px !important;
          margin-left: 24px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        :global(.leaflet-control-zoom-in), :global(.leaflet-control-zoom-out) {
          background-color: white !important;
          color: #666 !important;
          border: 1px solid #f3f4f6 !important;
          width: 40px !important;
          height: 40px !important;
          line-height: 40px !important;
          font-weight: bold !important;
        }
        :global(.leaflet-control-zoom-in) { border-radius: 12px 12px 0 0 !important; }
        :global(.leaflet-control-zoom-out) { border-radius: 0 0 12px 12px !important; }

        @keyframes strong-pulse {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.4; filter: brightness(1.2); }
        }
        .animate-strong-pulse {
          animation: strong-pulse 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MissionMap;

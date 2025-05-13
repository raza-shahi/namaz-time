import { useEffect, useState } from "react";
import "./App.css";


function App() {
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // console.log(`Location: ${location}`);
  // console.log(`Coordinates: ${coordinates}`);
  // console.log(`Times: ${times}`);
  // console.log(`Loading: ${loading}`);
  // console.log(`Error: ${error}`);

  

  const SUNRISE_API = "https://api.sunrise-sunset.org/json";
  const NOMINATIM_API = "https://nominatim.openstreetmap.org/search";

  const fetchSunData = async (lat , lng)=>{
    try {
      setLoading(true);
    const response = await fetch(`${SUNRISE_API}?lat=${lat}&lng=${lng}&formatted=0`);
    const data = await response.json();
    
    setTimes(data.results);
    // console.log(data.results.sunrise);
    
    setError("");
    } catch (error) {
      console.error("Error fetching sun data:", error);
      setError("Failed to fetch sun data");
      
    }
    finally{
      setLoading(false);
    }
  }

  const handleLocationSearch = async ()=>{
     if (!location.trim()) return;
    try {
      setLoading(true);
      const response = await fetch(`${NOMINATIM_API}?q=${encodeURIComponent(location)}&format=json`);
      const data = await response.json();
      console.log("Location searched data", data); 
      
      if (data.length > 0) {
         const firstResult = data[0];
      const lat = parseFloat(firstResult.lat);
      const lon = parseFloat(firstResult.lon);
      
      console.log(`Found coordinates: ${lat}, ${lon}`); // Debug log
      setCoordinates({ lat: lat, lng: lon });
        setError("");
        fetchSunData(lat, lon);
      } else {
        setError("Location not found");
      }
      
    } catch (error) {
      console.error("Error fetching location data:", error);
      setError("Failed to fetch location data");
      
    }
    finally{
        setLoading(false);
      }
  };

  const handleCurrentLocation = async () => {
    if(!navigator.geolocation){
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async(position)=>{
        const {latitude,longitude} = position.coords;
        setCoordinates({lat:latitude,lng:longitude});
         await fetchSunData(latitude , longitude);

         try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await response.json();
          if (data.address) {
            const { city, town, village } = data.address;
            setLocation(city || town || village || "Unknown");
          }
         } catch (err) {
          console.error('Reverse geocoding failed', err);
         }
      },
      (err) => {
        setError('Unable to retrieve your location');
        console.error(err);
        setLoading(false);
      }
      
    );

  }
  
  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sunr = formatTime(times?.sunrise);
  // console.log(sunr);
  


  return (
    <>
      <div className="bg-gray-100 h-screen flex flex-col items-center">
        <h1 className="text-5xl mb-3 text-slate-800 mt-10">Namaz Time</h1>
        <div className="mb-4">
          <input type="text" placeholder="Enter Cuty Name"
           value={location}
           onChange={(e) => setLocation(e.target.value)}
            className="border-2 border-gray-300 rounded-lg p-2 mx-4"
          />
          <button
            onClick={handleLocationSearch}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            Search
          </button>
        </div>
        <div className="w-full flex justify-center items-center mb-4">
          <button
            onClick={handleCurrentLocation}
            disabled={loading}
            className="p-2 border cursor-pointer w-100 text-xl border-gray-300 rounded-lg bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
            title="Use current location"
          >
            Current Location
          </button>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 w-96">
          
          {loading && <p className="text-gray-500">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <h2 className="text-2xl font-semibold mb-4">Location: {location}</h2>
          {times && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold">Sunrise and Sunset Times</h2>
              <div className="text-lg">
                <p className="mb-2">सूर्योदय: {sunr}</p>
              <p>सूर्यास्त: {formatTime(times.sunset)}</p>
              </div>
            </div>
          )}
          {times && (
            <div className="mt-4 ">
              <h2 className="text-xl font-semibold">Sunset and Maghrib Times</h2>
              <div className="text-lg">
                <p className="mb-2">सूर्यास्त: {formatTime(times.sunset)}</p>
              <p>मग़रिब: {formatTime(times.sunset)}</p>
              </div>
            </div>
          )}

         
        </div>
      </div>
    </>
  );
}

export default App;

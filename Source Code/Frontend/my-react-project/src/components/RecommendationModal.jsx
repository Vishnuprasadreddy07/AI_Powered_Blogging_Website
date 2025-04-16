import React, { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";

const RecommendationPage = () => {
  const [rec, setRec] = useState([]);
  const [events, setEvents] = useState([]);
  const [musicalEvents, setMusicalEvents] = useState([]);
  const [sportsEvents, setSportsEvents] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({});
  const [weatherdata, setWeatherdata] = useState({});
  const kelvinToFahrenheit = (tempKelvin) => {
    return ((tempKelvin - 273.15) * 9) / 5 + 32;
  };

  useEffect(() => {
    const handleGetOpenAIRecommendations = async () => {
      try {
        const locationResponse = await fetch("https://ipapi.co/json/");
        if (!locationResponse.ok) {
          throw new Error("Failed to fetch location information");
        }
        const locationData = await locationResponse.json();
        const apiKey = "70e49117b80f210af90236e6189abc4a";
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${locationData.latitude}&lon=${locationData.longitude}&appid=${apiKey}`
        );
        if (!weatherResponse.ok) {
          throw new Error("Failed to fetch weather information");
        }
        const weatherData = await weatherResponse.json();
        setCurrentLocation(locationData);
        setWeatherdata(weatherData);
        console.log(locationData);
        console.log(weatherData);
        const postData = {
          location: locationData,
          weather: weatherData,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        };

        const backendResponse = await fetch("http://localhost:5000/api/data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });
        if (!backendResponse.ok) {
          throw new Error("Failed to send data to the backend");
        }

        const responseData = await backendResponse.json();

        setRec(responseData.completions);
        setEvents(responseData.sr);
        setMusicalEvents(responseData.completion2);
        setSportsEvents(responseData.completion3);
        console.log(responseData.completion3);
        initMap(
          locationData.latitude,
          locationData.longitude,
          responseData.completions,
          responseData.completion2,
          responseData.completion3
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    handleGetOpenAIRecommendations();
  }, []);

  const initMap = (
    latitude,
    longitude,
    restaurants,
    musicalEvents,
    sportsEvents
  ) => {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: latitude, lng: longitude },
      zoom: 12,
    });

    // Create marker for user's location
    const userMarker = new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png", // Green balloon icon
        scaledSize: new window.google.maps.Size(40, 40), // Size of the marker
      },
      title: "You are here",
      label: "You are here", // Label for the marker
    });

    // Function to create marker and info window
    const createMarker = (item, iconUrl, label) => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: item.gps_coordinates.latitude,
          lng: item.gps_coordinates.longitude,
        },
        map: map,
        title: item.title,
        label: label,
        icon: {
          url: iconUrl,
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });

      const formatOperatingHours = (hoursObj) => {
        if (!hoursObj) return "Operating hours not available";
        let hoursString = "";
        for (const [day, hours] of Object.entries(hoursObj)) {
          hoursString += `${
            day.charAt(0).toUpperCase() + day.slice(1)
          }: ${hours}<br>`;
        }
        return hoursString;
      };

      const formatOpenState = (openState, details) => {
        return openState || details || "Information not available";
      };

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div>
                    <h3>${item.title}</h3>
                    <p>${
                      Array.isArray(item.address)
                        ? item.address.join(", ")
                        : item.address
                    }</p>
                    <p>${formatOpenState(item.open_state, item.details)}</p>
                    <p><strong>Operating Hours:</strong></p>
                    <p>${formatOperatingHours(item.operating_hours)}</p>
                  </div>`,
      });
      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    };
    const createMarker2 = (item, iconUrl, label) => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: item.gps_coordinates.latitude,
          lng: item.gps_coordinates.longitude,
        },
        map: map,
        label: label,
        title: item.title,
        icon: {
          url: iconUrl,
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });

      const formatOperatingHours = (hoursObj) => {
        if (!hoursObj) return "Operating hours not available";
        let hoursString = "";
        for (const [day, hours] of Object.entries(hoursObj)) {
          hoursString += `${
            day.charAt(0).toUpperCase() + day.slice(1)
          }: ${hours}<br>`;
        }
        return hoursString;
      };

      const formatOpenState = (openState, details) => {
        return openState || details || "Information not available";
      };
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div>
                    <h3>${item.sport.title}</h3>
                    <p>${
                      Array.isArray(item.sport.address)
                        ? item.sport.address.join(", ")
                        : item.sport.address
                    }</p>
                    <p><strong>Description:</strong></p>
                    <p>${item.sport.description}</p>
                    <p><strong>Start date:</strong></p>
                    <p>${item.sport.date.when}</p>
                    <p><strong>Link for Indetail description:</strong></p>
                    <p>${item.sport.link}</p>
                  </div>`,
      });
      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    };
    // Create markers for restaurants
    restaurants.forEach((restaurant) => {
      createMarker(
        restaurant,
        "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        "Restaurant"
      );
    });
    // Create markers for musical events
    musicalEvents.forEach((event) => {
      createMarker(
        event,
        "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        "Musical Event"
      );
    });
    // Create markers for sports events
    sportsEvents.forEach((event) => {
      createMarker2(
        event,
        "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
        "Sports Event"
      );
    });
  };

  return (
    <div style={{ padding: "1rem" }}>
      <Typography variant="h6" gutterBottom style={{ marginBottom: "1rem" }}>
        AI Recommendations
      </Typography>
      <div
        id="map"
        style={{ height: "400px", width: "100%", border: "1px solid #ccc" }}
      ></div>
      {weatherdata.main && (
        <Typography style={{ padding: "10px", marginTop: "20px" }}>
          Current location is {currentLocation.city} and temperature is{" "}
          {kelvinToFahrenheit(weatherdata.main.temp)}°F
        </Typography>
      )}
      <Box border={1} p={2} style={{ padding: "1rem", marginTop: "1rem" }}>
        <Typography variant="body1" gutterBottom>
          Here are the recommended restaurants by OpenAI:
        </Typography>
        <div>
          {rec &&
            rec.map((restaurant, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <Box border={1} p={2}>
                  <Typography variant="h6">{restaurant.title}</Typography>
                  <Typography>
                    {Array.isArray(restaurant.address)
                      ? restaurant.address.join(", ")
                      : restaurant.address}
                  </Typography>
                  {/* Render other restaurant details as needed */}
                </Box>
              </div>
            ))}
        </div>
      </Box>
      <Box border={1} p={2} style={{ padding: "1rem", marginTop: "1rem" }}>
        <Typography variant="body1" gutterBottom>
          Here are the recommended music events by OpenAI:
        </Typography>
        <div>
          {musicalEvents &&
            musicalEvents.map((event, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <Box border={1} p={2}>
                  <Typography variant="h6">{event.title}</Typography>
                  <Typography>
                    {Array.isArray(event.address)
                      ? event.address.join(", ")
                      : event.address}
                  </Typography>
                  {/* Render other event details as needed */}
                </Box>
              </div>
            ))}
        </div>
      </Box>
      <Box border={1} p={2} style={{ padding: "1rem", marginTop: "1rem" }}>
        <Typography variant="body1" gutterBottom>
          Here are the recommended sports events by OpenAI:
        </Typography>
        <div>
          {sportsEvents &&
            sportsEvents.map((event, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <Box border={1} p={2}>
                  <Typography variant="h6">{event.sport.title}</Typography>
                  <Typography>
                    {Array.isArray(event.sport.address)
                      ? event.sport.address.join(", ")
                      : event.sport.address}
                  </Typography>
                  {/* Render other event details as needed */}
                </Box>
              </div>
            ))}
        </div>
      </Box>
    </div>
  );
};

export default RecommendationPage;

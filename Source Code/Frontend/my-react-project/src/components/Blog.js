import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Header from "./Header";
import FeaturedPost from "./FeaturedPost";
import Footer from "./Footer";
import { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import { useLocation } from "react-router-dom";
import "./styles.css";

const sections = [
  { title: "Academic Resources" },
  { title: "Career Services" },
  { title: "Campus" },
  { title: "Culture" },
  { title: "Local Community Resources" },
  { title: "Social" },
  { title: "Sports" },
  { title: "Health and Wellness" },
  { title: "Technology" },
  { title: "Travel" },
  { title: "Alumni" },
  { title: "All posts" },
];

const defaultTheme = createTheme();

export default function Blog(props) {
  const [posts, setPosts] = useState([]);
  const [filteredposts, setFilteredPosts] = useState([]);
  const { selectedSection, setSelectedSection, data } = props;
  const [messages, setMessages] = useState([]);
  const [chatbotMessages, setChatbotMessages] = useState([]); // For ChatGPT
  const [openModal, setOpenModal] = useState(false); // For Recommendation Bot
  const [openChatbotModal, setOpenChatbotModal] = useState(false); // For ChatGPT
  const location = useLocation();
  const refreshFlag = props;

  useEffect(() => {
    const fetchData = async () => {
      const posts = await data.getPosts();
      setPosts(posts);
    };
    fetchData();
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      const posts = await data.getPosts();
      setFilteredPosts(posts);
    };
    fetchData();
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      const fp = await data.getPostsByTopic(selectedSection, posts);
      setFilteredPosts(fp);
    };
    if (posts.length > 0) {
      fetchData();
    }
  }, [posts, selectedSection]);

  useEffect(() => {
    const fetchData = async () => {
      const fp = await data.getPostsByTopic(selectedSection, posts);
      setFilteredPosts(fp);
    };
    if (filteredposts.length <= 0) {
      fetchData();
    }
  }, [filteredposts, selectedSection]);

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await data.getPosts();
      setPosts(posts);
    };
    fetchPosts();
  }, []);

  const users = data.getUsers();

  useEffect(() => {
    const fetchData = async () => {
      const posts = await data.getPosts();
      setPosts(posts);
    };
    fetchData();
  }, [refreshFlag]);

  // ✅ Recommendation bot handler
  const handleSendMessage = async (message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, sender: "user" },
    ]);

    try {
      const { completions, completion2, completion3 } =
        await fetchDataFromBackend();
      const responseMessage = `Restaurants:\n${formatRestaurants(
        completions
      )}\n\nMusical events:\n${formatEvents(
        completion2
      )}\n\nSports events:\n${formatSportsEvents(completion3)}`;
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: responseMessage, sender: "Assistant" },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // ✅ ChatGPT general assistant handler
  const handleChatbotMessage = async (message) => {
    setChatbotMessages((prev) => [...prev, { text: message, sender: "user" }]);

    try {
      const response = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: message }),
      });

      const data = await response.json();

      setChatbotMessages((prev) => [
        ...prev,
        { text: data.reply, sender: "Assistant" },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setChatbotMessages((prev) => [
        ...prev,
        {
          text: "Oops! Something went wrong. Try again later.",
          sender: "Assistant",
        },
      ]);
    }
  };

  const fetchDataFromBackend = async () => {
    try {
      const locationData = {
        latitude: 41.843783178979265,
        longitude: -87.62321154781516,
        city: "Chicago",
      };
      const apiKey = "70e49117b80f210af90236e6189abc4a";
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${locationData.latitude}&lon=${locationData.longitude}&appid=${apiKey}`
      );
      const weatherData = await weatherResponse.json();
      const postData = {
        location: locationData,
        weather: weatherData,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };

      const backendResponse = await fetch("http://localhost:4000/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      const responseData = await backendResponse.json();
      return {
        completions: responseData.completions,
        completion2: responseData.completion2,
        completion3: responseData.completion3,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      return {};
    }
  };

  const formatRestaurants = (restaurants) => {
    return restaurants
      .map((restaurant, index) => {
        const { title, address, open_state, operating_hours } = restaurant;
        let hours = "";
        for (let day in operating_hours) {
          hours += `- ${day}: ${operating_hours[day]}\n`;
        }
        return `${
          index + 1
        }. ${title}\n   Address: ${address}\n   Open State: ${open_state}\n   Operating Hours:\n${hours}`;
      })
      .join("\n");
  };

  const formatEvents = (events) => {
    return events
      .map((event, index) => {
        const { title, address, open_state, description, operating_hours } =
          event;
        let hours = "";
        for (let day in operating_hours) {
          hours += `- ${day}: ${operating_hours[day]}\n`;
        }
        return `${
          index + 1
        }. ${title}\n   Address: ${address}\n   Open State: ${open_state}\n   Description: ${description}\n   Operating Hours:\n${hours}`;
      })
      .join("\n");
  };

  const formatSportsEvents = (events) => {
    return events
      .map((event, index) => {
        const { sport, gps_coordinates } = event;
        const { title, date, address, link, description } = sport;
        const eventDate = new Date(date);
        const formattedDate = `${eventDate.toLocaleDateString()} ${eventDate.toLocaleTimeString()}`;
        return `${
          index + 1
        }. ${title}\n   Date: ${formattedDate}\n   Address: ${address.join(
          ", "
        )}\n   Link: ${link}\n   Description: ${description}\n   Coordinates: (${
          gps_coordinates.latitude
        }, ${gps_coordinates.longitude})`;
      })
      .join("\n");
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header
          title="Blog"
          users={users}
          setFilteredPosts={setFilteredPosts}
          sections={sections}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
        />
        <main>
          <Grid container spacing={4}>
            {filteredposts.map((post) => (
              <FeaturedPost key={post.id} post={post} />
            ))}
          </Grid>
        </main>
      </Container>
      <Footer title="Footer" description="Something here to give the footer a purpose!" />

      {/* Button for Recommendation Assistant */}
      {/* <button
        onClick={() => setOpenModal(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: "1000",
          padding: "10px 20px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#007bff",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        Open Chatbot (Assistant)
      </button> */}

      {/* Button for ChatGPT AI */}
      <button
        onClick={() => setOpenChatbotModal(true)}
        style={{
          position: "fixed",
          bottom: "70px",
          right: "20px",
          zIndex: "1000",
          padding: "10px 20px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#28a745",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        Chat with AI
      </button>

      {/* Modal: Recommendation Assistant */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="chatbot-modal-title"
        aria-describedby="chatbot-modal-description"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Chatbot messages={messages} onSendMessage={handleSendMessage} />
      </Modal>

      {/* Modal: ChatGPT AI Assistant */}
      <Modal
        open={openChatbotModal}
        onClose={() => setOpenChatbotModal(false)}
        aria-labelledby="chatgpt-modal-title"
        aria-describedby="chatgpt-modal-description"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Chatbot messages={chatbotMessages} onSendMessage={handleChatbotMessage} />
      </Modal>
    </ThemeProvider>
  );
}

function Chatbot({ messages, onSendMessage }) {
  const [inputText, setInputText] = useState("");

  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() !== "") {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f0f0",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        width: "100%",
      }}
    >
      <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "10px" }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              textAlign: message.sender === "user" ? "right" : "left",
              marginBottom: "10px",
              fontSize: "16px",
            }}
          >
            <span style={{ fontWeight: "bold" }}>
              {message.sender === "user" ? "You: " : "Assistant: "}
            </span>
            {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={handleChange}
          placeholder="Type your message..."
          style={{
            width: "calc(100% - 80px)",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

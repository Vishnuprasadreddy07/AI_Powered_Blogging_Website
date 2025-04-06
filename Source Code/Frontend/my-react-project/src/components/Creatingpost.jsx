import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CreatingPost(props) {
  const navigate = useNavigate();
  const { data, triggerRefresh } = props;

  const [post, setPost] = useState({
    title: "",
    body: "",
    author: "",
    topic: "",
    comments: [],
  });

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
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPost({ ...post, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const email = localStorage.getItem("email");
      const postSend = {
        ...post,
        email,
      };

      const response = await fetch("http://localhost:5000/api/newpost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postSend),
      });

      if (!response.ok) {
        throw new Error("Failed to send post to the backend");
      }

      toast("New Notification: New Post Created!");
      triggerRefresh();
      navigate("/");
    } catch (error) {
      console.error("Error sending post to the backend:", error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Create a New Post
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="title" style={{ display: "block", marginBottom: "5px" }}>
            Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={post.title}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="body" style={{ display: "block", marginBottom: "5px" }}>
            Body:
          </label>
          <textarea
            id="body"
            name="body"
            value={post.body}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          ></textarea>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="author" style={{ display: "block", marginBottom: "5px" }}>
            Author:
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={post.author}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <FormControl fullWidth>
            <InputLabel id="select-options-label">Select Option</InputLabel>
            <Select
              labelId="select-options-label"
              id="select-options"
              onChange={handleChange}
              label="Select Option"
              name="topic"
              value={post.topic}
              required
            >
              {sections.map((option, index) => (
                <MenuItem key={index} value={option.title}>
                  {option.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <button
          type="submit"
          style={{
            background: "#007bff",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "3px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default CreatingPost;

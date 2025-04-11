import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button, TextField } from "@mui/material";

function PostinDetail() {
  const location = useLocation();
  const { post: locationPost } = location.state || {};

  const [post, setPost] = useState(locationPost || null);
  const [comments, setComments] = useState(locationPost?.comments || []);
  const [reply, setReply] = useState("");
  const [summary, setSummary] = useState("");
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const loggedIn = localStorage.getItem("loggedIn");

  const fetchPostFromServer = async (title, body) => {
    try {
      const response = await fetch("http://localhost:5000/api/get-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      });

      if (!response.ok) {
        throw new Error("Post not found or error fetching it");
      }

      const matchedPost = await response.json();
      setPost(matchedPost);
      setComments(matchedPost.comments || []);
    } catch (error) {
      console.error("❌ Error fetching exact post:", error);
    }
  };

  useEffect(() => {
    const loadPost = async () => {
      let title = locationPost?.title;
      let body = locationPost?.body;
  
      // Case 1: If locationPost exists (navigated from homepage)
      if (locationPost) {
        localStorage.setItem("postTitle", title);
        localStorage.setItem("postBody", body);
      } else {
        // Case 2: Reloaded the page (fallback to localStorage)
        title = localStorage.getItem("postTitle");
        body = localStorage.getItem("postBody");
      }
  
      // Fetch from backend if title/body are available
      if (title && body) {
        await fetchPostFromServer(title, body);
      }
    };
  
    loadPost();
  
    return () => {
      localStorage.removeItem("postTitle");
      localStorage.removeItem("postBody");
    };
  }, []);
  

  const handleClick = async () => {
    const name = localStorage.getItem("userName");
    const trimmedReply = reply.trim();

    if (!post || !post.title || !post.body) {
      alert("Post data is incomplete.");
      return;
    }

    if (!name || !trimmedReply) {
      alert("Please fill in the reply before submitting.");
      return;
    }

    const payload = {
      title: post.title,
      body: post.body,
      author: name,
      text: trimmedReply,
    };

    try {
      const response = await fetch("http://localhost:5000/api/add-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add comment");
      }

      // Re-fetch latest post after comment added
      await fetchPostFromServer(post.title, post.body);
      setReply("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Error: " + error.message);
    }
  };

  const handleFillTextField = async () => {
    setShowAdditionalInfo(!showAdditionalInfo);
    if (!showAdditionalInfo) {
      try {
        const response = await fetch("http://localhost:5000/api/generate-reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ post }),
        });

        if (!response.ok) {
          throw new Error("Failed to send post to the backend");
        }

        const responseData = await response.json();
        setReply(responseData.generatedReply);
      } catch (error) {
        console.error("Error sending post to the backend:", error);
      }
    } else {
      setReply("");
    }
  };

  const handleGetSummary = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/get-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ post }),
      });

      if (!response.ok) {
        throw new Error("Failed to get summary from backend");
      }

      const result = await response.json();
      setSummary(result.summary);
    } catch (error) {
      console.error("Error getting summary from backend:", error);
    }
  };

  if (!post) {
    return <p>Post not found or not passed correctly.</p>;
  }

  const { title, topic, body, status } = post;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>{title}</h1>
      <h2 style={{ fontSize: "18px", marginBottom: "5px" }}>Author: {status}</h2>
      <h3 style={{ fontSize: "16px", fontStyle: "italic", marginBottom: "0" }}>Topic: {topic}</h3>
      <p style={{ fontSize: "16px", lineHeight: "1.6", marginBottom: "20px" }}>{body}</p>

      {loggedIn && (
        <>
          <TextField
            label="Enter reply"
            variant="outlined"
            fullWidth
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
          <Button
            style={{
              backgroundColor: "#4caf50",
              color: "white",
              borderRadius: "5px",
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              marginRight: "10px",
            }}
            onClick={handleClick}
          >
            Add a reply
          </Button>
          <Button
            style={{
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "5px",
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              marginRight: "10px",
            }}
            onClick={handleFillTextField}
          >
            {showAdditionalInfo ? "Disable reply by ChatGPT" : "Generate reply by ChatGPT"}
          </Button>
          <Button
            style={{
              backgroundColor: "#6c63ff",
              color: "white",
              borderRadius: "5px",
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              marginTop: "10px",
            }}
            onClick={handleGetSummary}
          >
            Get summary using OpenAI
          </Button>
        </>
      )}

      <h2 style={{ fontSize: "20px", marginBottom: "10px", marginTop: "30px" }}>Reply Section</h2>
      <div style={{ backgroundColor: "#f0f0f0", padding: "10px", marginBottom: "10px" }}>
        {comments?.map((comment, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <p style={{ margin: "0", padding: "5px 0", fontWeight: "bold" }}>{comment.text}</p>
            <p style={{ margin: "0", padding: "5px 0", color: "#888" }}>Author: {comment.author}</p>
          </div>
        ))}
      </div>

      {summary && (
        <>
          <h2 style={{ fontSize: "20px", marginTop: "30px" }}>Post Summary</h2>
          <div
            style={{
              backgroundColor: "#e0e0ff",
              padding: "10px",
              borderRadius: "5px",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            {summary}
          </div>
        </>
      )}
    </div>
  );
}

export default PostinDetail;

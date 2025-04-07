import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Datac from "./Datac";
import { Button, TextField } from "@mui/material";

function PostinDetail(props) {
  const { postId } = useParams();
  const { data } = props;
  const [reload, setReload] = useState(false);
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState(null);
  const [reply, setReply] = useState("");
  const [summary, setSummary] = useState(""); // New state for summary
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const loggedIn = localStorage.getItem("loggedIn");

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await data.getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [data, comments]);

  const post = posts?.find((e) =>
    e.id?.toString() === postId || e._id?.toString() === postId
  );
  
  const { body, status, title, topic } = post || {};

  const handleClick = async () => {
    const name = localStorage.getItem("userName");
    const comment = {
      postId,
      author: name,
      text: reply,
    };
    await data.addComment(comment);
    setComments((comments) => [...comments, comment]);
    setReply("");
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
      setSummary(result.summary); // Assume backend returns { summary: "...text..." }
    } catch (error) {
      console.error("Error getting summary from backend:", error);
    }
  };

  useEffect(() => {
    const updatedPost = posts?.find((e) => e.id == postId);
    if (updatedPost) {
      const updatedComments = updatedPost.comments;
      setComments(updatedComments);
    }
  }, [reload, postId, posts]);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {post ? (
        <>
          <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>{title}</h1>
          <h2 style={{ fontSize: "18px", marginBottom: "5px" }}>Author: {status}</h2>
          <h3 style={{ fontSize: "16px", fontStyle: "italic", marginBottom: "0" }}>Topic: {topic}</h3>
          <p style={{ fontSize: "16px", lineHeight: "1.6", marginBottom: "20px" }}>{body}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}

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
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
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
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
              marginRight: "10px",
            }}
            onClick={handleFillTextField}
          >
            {showAdditionalInfo ? "Disable reply by ChatGPT" : "Generate reply by ChatGPT"}
          </Button>
          {/* New Summary Button */}
          <Button
            style={{
              backgroundColor: "#6c63ff",
              color: "white",
              borderRadius: "5px",
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
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

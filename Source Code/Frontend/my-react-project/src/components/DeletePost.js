import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DeletePost = ({ data, triggerRefresh }) => {
  const [posts, setPosts] = useState([]);
  const [shouldRedirect, setShouldRedirect] = useState(false); // 👈 NEW
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      const fetchedPosts = await data.getPosts();
      setPosts(fetchedPosts);
    };
    fetchPosts();
  }, [data]);

  useEffect(() => {
    if (shouldRedirect) {
      navigate("/"); // ✅ Only navigates once state is ready
    }
  }, [shouldRedirect, navigate]);

  const handleDelete = async (post) => {
    try {
      const response = await fetch("http://localhost:5000/api/deletepost", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: post.title,
          body: post.body,
          author: post.author,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData.message);
        throw new Error("Failed to delete post");
      }
  
      setPosts((prevPosts) =>
        prevPosts.filter(
          (p) =>
            p.title !== post.title ||
            p.body !== post.body ||
            p.author !== post.author
        )
      );
  
    } catch (error) {
      console.error("Error deleting post:", error);
    }
    triggerRefresh();
    navigate("/");// 👈 Full guaranteed redirect
  };
  
  

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>All Posts</h2>
      {posts.map((post) => (
        <div key={post._id || post.title} style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "10px", color: "#333" }}>{post.title}</h3>
          <p style={{ marginBottom: "10px" }}>{post.body}</p>
          <button
            onClick={() => handleDelete(post)}
            style={{
              backgroundColor: "#f44336",
              color: "#fff",
              padding: "8px 16px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default DeletePost;

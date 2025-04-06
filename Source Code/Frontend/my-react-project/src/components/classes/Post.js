import React from "react";
import Data from "../../Postsdata.json";

class Post {
  constructor(id, title, body, author, topic, comments) {
    this.id = id;
    this.title = title;
    this.body = body;
    this.status = author;
    this.topic = topic;
    this.comments = comments;
  }

  parseData = async () => {
    for (let i = 0; i < Data.length; i++) {
      this.state.push(Data[i]);
    }
  };

  async getPosts() {
    try {
      const response = await fetch("http://localhost:5000/api/posts");  // Change to port 5000
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      const posts = data.map(
        (post) =>
          new Post(
            post.id,
            post.title,
            post.body,
            post.author,
            post.topic,
            post.comments
          )
      );
      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return []; // Return an empty array or handle the error as appropriate
    }
  }

  async getPostsByTopic(topic) {
    try {
      const response = await fetch("http://localhost:5000/api/posts");  // Change to port 5000
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      console.log(data);
      const fp = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].topic === topic) {
          fp.push(
            new Post(
              data[i].id,
              data[i].title,
              data[i].body,
              data[i].author,
              data[i].topic,
              data[i].comments
            )
          );
        }
      }
      console.log(fp);
      return fp;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return []; // Return an empty array or handle the error as appropriate
    }
  }
}

export default Post;

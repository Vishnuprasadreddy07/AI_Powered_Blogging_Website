import User from "./classes/User";
import Post from "./classes/Post";

const user = new User();
const post = new Post();

class Datac {
  constructor() {
    this.state = {
      users: [],
      admins: [],
      faculty: [],
      moderator: [],
      staff: [],
      posts: [],
      students: [],
    };
    this.state.users = user.getUsers();
    this.state.posts = post.getPosts();
  }
  getUsers() {
    return this.state.users;
  }
  getPosts() {
    // console.log("1" + this.state.posts + "calling from DATAC");
    return this.state.posts;
  }

  getPostsByTopic = (topic, data) => {
    const fp = [];
    if (topic == "" || topic == "All posts") {
      return data;
    }
    for (let i = 0; i < data.length; i++) {
      if (data[i].topic == topic) {
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
    // console.log("From Datac" + topic);
    return fp;
  };
  addPost = (post) => {
    this.state.posts.push(
      new Post(
        post.id,
        post.title,
        post.body,
        post.author,
        post.topic,
        post.comments
      )
    );
    console.log("post array updated");
  };

  deletePost = (postId) => {
    this.state.posts = this.state.posts.filter((post) => post.id !== postId);
    console.log("post deleted");
  };
  addComment = (comment) => {
    console.log("From Data");
    console.log(comment);
    for (let i = 0; i < this.state.posts.length; i++) {
      if (Number(this.state.posts[i].id) === Number(comment.postId))
        {
        this.state.posts[i].comments.push(comment);
        console.log("comment added");
      }
    }
    console.log(this.state.posts);
  };
  
  toggleUserStatus = (userId) => {
    const { users } = this.state;
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return {
          ...user,
          status: user.status === "active" ? "inactive" : "active",
        };
      }
      return user;
    });
    this.state.users = updatedUsers;
    // console.log("User status updated" + updatedUsers);
    return this.state.users;
  };
}

export default Datac;

import * as React from "react";
import Blog from "./components//Blog.js";
import Student from "./components/classes/Student.js";
import User from "./components/classes/User.js";
import "./App.css";
import { ToastContainer } from "react-toastify";
import SignUp from "./components/SignUp.js";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Datac from "./components/Datac.js";
import Post from "./components/classes/Post.js";
import { useState } from "react";
import PostinDetail from "./components/Postindetail.jsx";
import CreatePost from "./components/Creatingpost.jsx";
import DeletePost from "./components/DeletePost.js";
import DisableUser from "./components/DisableUser.js";
import RecommendationModal from "./components/RecommendationModal.jsx";

function App() {
  const student = new Student();
  student.parseData();
  const studentsData = student.getStudents();
  const data = new Datac();
  const users = data.getUsers();
  const posts = data.getPosts();
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshFlag(prev => !prev);
  const deletePost = (id) => {
    data.deletePost(id);
  };
  
  // console.log(posts);
  // const post = new Post();
  // const postdata = post.getPosts();
  // console.log("In App.js");
  // console.log(posts);

  // data.addPost(posts[0]);
  // const fp = data.getPostsByTopic("", data.getPosts());
  // console.log(fp);
  const [selectedSection, setSelectedSection] = React.useState("");

  return (
    <div className="Main page">
      <BrowserRouter>
        <Routes>
          <Route
            exact
            path="/"
            element={
              <Blog
                data={data}
                selectedSection={selectedSection}
                setSelectedSection={setSelectedSection}
                refreshFlag={refreshFlag}
                key={refreshKey} triggerRefresh={triggerRefresh}
              />
            }
          />
          <Route
            path="/deletpost"
            element={
              <DeletePost data={data} deletePost={(id) => deletePost(id)} triggerRefresh={triggerRefresh} />
            }
          />
          <Route path="/post/:postId" element={<PostinDetail data={data} />} />
          <Route
            path="/logined/createpost"
            element={<CreatePost data={data} triggerRefresh={triggerRefresh} selectedSection={selectedSection}
                setSelectedSection={setSelectedSection}
                refreshFlag={refreshFlag} />}
          />
          <Route path="/disableuser" element={<DisableUser data={data} />} />
          <Route
            path="/recommendation-page"
            element={<RecommendationModal />}
          />
          <Route path="/signup" element = {<SignUp />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
      {/* <Blog /> */}
    </div>
  );
}

export default App;

import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Toolbar,
  Button,
  IconButton,
  Typography,
  Box,
  Modal,
  InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Icon from "./Icon";
import Login from "./Login";
import RecommendationModal from "./RecommendationModal";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Header(props) {
  const {
    sections,
    title,
    setSelectedSection,
    selectedSection,
    setFilteredPosts,
  } = props;

  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [type, setUserType] = useState("");
  const [status, setStatus] = useState("");
  const [topicsub, setTopicSub] = useState([]);
  const [openRecommendationModal, setOpenRecommendationModal] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    console.log("topicsub updated:", topicsub);
  }, [topicsub]);

  const isSubscribed = useMemo(
    () => topicsub.includes(selectedSection),
    [topicsub, selectedSection]
  );

  useEffect(() => {
    const loggedInState = localStorage.getItem("loggedIn");
    const userNameStored = localStorage.getItem("userName");
    const status1 = localStorage.getItem("status");
    const type2 = localStorage.getItem("type");

    if (loggedInState === "true" && userNameStored) {
      setLoggedIn(true);
      setUserName(userNameStored);
      setUserType(type2);
      setStatus(status1);
    }
  }, [open]);

  useEffect(() => {
    console.log("selectedSection updated:", selectedSection);
  }, [selectedSection]);

  useEffect(() => {
    console.log("topicsub updated:", topicsub);
  }, [topicsub]);

  const handleLogout = () => {
    setUserName("");
    setLoggedIn(false);
    setUserType("");
    setStatus("");
    localStorage.clear();
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section.title);
  };

  const handleSearch = async (event) => {
    const searchQuery = event.target.value;

    try {
      const response = await fetch("http://localhost:5000/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchQuery }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const searchResults = await response.json();
      setFilteredPosts(searchResults);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleSubscribe = () => {
    if (!selectedSection) {
      toast.error("Please select a section first.");
      return;
    }
  
    setTopicSub((prev) => {
      const updated = prev.includes(selectedSection)
        ? prev.filter((t) => t !== selectedSection)
        : [...prev, selectedSection];
      return updated;
    });
  };
  

  const handlecreatebutton = () => navigate("/logined/createpost");
  const handledeletepost = () => navigate("/deletpost");
  const handledisableuser = () => navigate("/disableuser");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenRecommendationModal = () => setOpenRecommendationModal(true);
  const handleCloseRecommendationModal = () => setOpenRecommendationModal(false);

  return (
    <React.Fragment>
      <ToastContainer />
      <Toolbar sx={{ borderBottom: 1, borderColor: "divider" }}>
        {loggedIn && (
          <>
            <Button size="small" onClick={handlecreatebutton}>
              Create Post
            </Button>
            {selectedSection && (
              <Button onClick={handleSubscribe}>
                {isSubscribed ? "Unsubscribe" : "Subscribe"}
              </Button>
            )}
          </>
        )}
        {(type === "Moderator" || type === "Administrator") && (
          <Button size="small" onClick={handledeletepost}>
            Delete a post
          </Button>
        )}
        {type === "Administrator" && (
          <Button size="small" onClick={handledisableuser}>
            Disable a user
          </Button>
        )}
        <Button size="small" onClick={handleOpenRecommendationModal}>
          Recommended for you
        </Button>
        <Typography
          component="h2"
          variant="h5"
          color="inherit"
          align="center"
          noWrap
          sx={{ flex: 1 }}
        >
          {title}
        </Typography>
        <IconButton>
          <SearchIcon />
        </IconButton>
        <InputBase
          placeholder="Search..."
          sx={{
            marginLeft: 1,
            flex: 1,
            color: "inherit",
            "& .MuiInputBase-input": {
              color: "inherit",
            },
          }}
          onChange={handleSearch}
        />
        {loggedIn ? (
          <>
            <Icon inputData={userName} />
            <Button onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <Button onClick={handleOpen}>Sign in</Button>
        )}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "50%",
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Login users={props.users} handleClose={handleClose} />
          </Box>
        </Modal>
      </Toolbar>

      <Toolbar
        component="nav"
        variant="dense"
        sx={{ justifyContent: "space-between", overflowX: "auto" }}
      >
        {sections.map((section) => (
          <Button
            key={section.title}
            onClick={() => {
              console.log("Section clicked:", section);
              handleSectionClick(section);
            }}
            color="inherit"
            noWrap
            variant="body2"
            sx={{ p: 1, flexShrink: 0, fontSize: "0.65rem" }}
          >
            {section.title}
          </Button>
        ))}
      </Toolbar>

      {/* Optional: show subscribed topics */}
      <Typography
        variant="caption"
        sx={{ ml: 2, color: "#888", mt: 1 }}
      >
        Subscribed topics: {topicsub.length ? topicsub.join(", ") : "None"}
      </Typography>

      <Modal
        open={openRecommendationModal}
        onClose={handleCloseRecommendationModal}
        aria-labelledby="recommendation-modal-title"
        aria-describedby="recommendation-modal-description"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "70%",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            maxHeight: "85vh",
            overflow: "auto",
          }}
        >
          <RecommendationModal onClose={handleCloseRecommendationModal} />
        </Box>
      </Modal>
    </React.Fragment>
  );
}

Header.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  onSectionSelect: PropTypes.func.isRequired,
};

export default Header;

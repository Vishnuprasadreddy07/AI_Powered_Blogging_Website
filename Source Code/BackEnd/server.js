const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const nodemailer = require("nodemailer");
const { OpenAI } = require("openai");
const app = express();

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/myNewDatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: "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" }); // Enter your OpenAI key here
const SERPAPI_API_KEY = "bb0414e26bbb069854f8dbed7af5603304659662d59e8bee64273e41c4091811";

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: String, required: true },
  topic: { type: String, required: true },
  comments: [
    {
      text: { type: String, required: true },
      author: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  date: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  status: { type: String, default: "active" },
  type: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const Post = mongoose.model("Post", postSchema);
async function geocodeAddress(address) {
  const apiKey = "AIzaSyDjyfpL_xiJegt1s9icwZoYzzlPkftcMHE";
  const encodedAddress = encodeURIComponent(address.join(", "));
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data; // Accessing the data property directly

    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } else {
      throw new Error("No results found for the address");
    }
  } catch (error) {
    console.error("Error geocoding address:", error);
    throw error;
  }
}

// Toggle user status
app.put("/api/users/:id/toggle-status", async (req, res) => {
  try {
    const userId = parseInt(req.params.id); // using custom numeric `id`, not `_id`
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle status
    user.status = user.status === "active" ? "disabled" : "active";
    await user.save();

    res.status(200).json({ message: "User status updated", user });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.post("/api/get-post", async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Missing title or body" });
    }

    const post = await Post.findOne({ title, body });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in /api/get-post:", error);
    res.status(500).json({ message: "Server error while fetching post", error });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
});

// Fetch all posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, type, status } = req.body;

    if (!name || !email || !password || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const userCount = await User.countDocuments();
    const newUser = new User({
      id: userCount + 1,
      name,
      email,
      password,
      type,
      status: status || "active",
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error in signup API:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Summary generation function using OpenAI
async function generateOpenAISummary(post) {
  const { title, body } = post;

  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant that summarizes blog posts in a concise and informative way.",
    },
    {
      role: "user",
      content: `Summarize the following blog post titled "${title}" in 3-5 lines:\n\n${body}`,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages,
      max_tokens: 300,
      temperature: 0.7,
      top_p: 1,
    });

    const summary = response.choices[0].message.content.trim();
    return summary;
  } catch (error) {
    console.error("Error generating summary with OpenAI:", error);
    throw error;
  }
}

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "User is disabled" });
    }

    return res.status(200).json({
      message: "Login successful",
      name: user.name,
      email: user.email,
      type: user.type,
      status: user.status,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
});

app.post("/api/get-summary", async (req, res) => {
  const { post } = req.body;
  try {
    const summary = await generateOpenAISummary(post);
    console.log(summary);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: "Error generating summary" });
  }
});

// Insert a new post
app.post("/api/newpost", async (req, res) => {
  try {
    const { title, body, author, topic, email } = req.body; // ✅ include email if sent from frontend

    const newPost = new Post({
      title,
      body,
      author,
      topic,
      comments: [],
    });

    await newPost.save();

    if (email) {
      await emailSubscribed(topic, title, email, body); // ✅ corrected variable usage
    }

    res.status(201).json({ message: "Post added successfully", post: newPost });
  } catch (error) {
    console.error("Error saving new post:", error);
    res.status(500).json({ message: "Error inserting post", error });
  }
});

app.post("/api/chatbot", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const messages = [
      { role: "system", content: "You are a helpful assistant chatbot." },
      { role: "user", content: prompt },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages,
      max_tokens: 300,
      temperature: 0.7,
      top_p: 1,
    });

    const reply = response.choices[0].message.content.trim();
    res.json({ reply });
  } catch (error) {
    console.error("Error in chatbot API:", error);
    res.status(500).json({ error: "Error processing request" });
  }
});

// Add a comment to a post
app.post("/api/add-comment", async (req, res) => {
  try {
    const { title, body, author, text } = req.body;

    console.log("Incoming Comment Payload:");
    console.log("Title:", title);
    console.log("Body:", body);
    console.log("Author:", author);
    console.log("Text:", text);

    if (!title || !body || !author || !text) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const updatedPost = await Post.findOneAndUpdate(
      { title, body },
      { $push: { comments: { text, author, date: new Date() } } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Comment added", post: updatedPost });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment", error });
  }
});


app.post("/api/generate-reply", async (req, res) => {
  try {
    const { post } = req.body;
    console.log(post);
    rtitle = post.title;
    rcontent = post.body;
    openai.apiKey = "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"; // replace with your actual OpenAI API key
    // Generate completion using OpenAI API
    const messages = [
      { role: "system", content: "You are a reply generator." },
      {
        role: "user",
        content: `generate reply in 10 words for post title: ${rtitle}\n\n and content: ${rcontent}`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: messages,
      max_tokens: 30,
      temperature: 0.5,
      top_p: 1,
    });
    console.log(response);
    const { finish_reason, message } = response.choices[0];

    // Extract the generated reply content from the response
    const generatedReply = message.content;
    console.log(generatedReply);
    res.json({ generatedReply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// DELETE a post by ID
app.delete("/api/deletepost", async (req, res) => {
  try {
    const { title, body } = req.body;

    console.log("Request body:", req.body);

    const result = await Post.findOneAndDelete({ title, body });

    if (!result) {
      console.log("No matching post found.");
      return res.status(404).json({ message: "Post not found for deletion" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post", error });
  }
});


// Search for posts
app.post("/api/search", async (req, res) => {
  try {
    const { searchQuery } = req.body;
    const results = await Post.find({ title: { $regex: searchQuery, $options: "i" } });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Error searching posts", error });
  }
});

// Generate AI-based Reply
// app.post("/api/generate-reply", async (req, res) => {
//   try {
//     const { post } = req.body;
//     const messages = [
//       { role: "system", content: "You are a reply generator." },
//       {
//         role: "user",
//         content: `Generate a reply in 10 words for post title: ${post.title}\n\n and content: ${post.body}`,
//       },
//     ];

//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo-16k",
//       messages: messages,
//       max_tokens: 30,
//       temperature: 0.5,
//       top_p: 1,
//     });

//     const generatedReply = response.choices[0].message.content;
//     res.json({ generatedReply });
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Email Notification Function
async function emailSubscribed(topic, title, email, content) {
  console.log(email);
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "robertlewandowski9reus11@gmail.com",
      pass: "dhlj mijo txgh dmcy",
    },
  });

  const htmlTemplate = `
  <style>
    .post-summary {
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
      padding: 15px;
    }

    .post-summary h1 {
      font-size: 1.5em;
      margin-bottom: 5px;
    }

    .post-summary p {
      font-size: 0.9em;
      margin-bottom: 10px;
    }

    .post-summary a {
      color: #333;
      text-decoration: none;
    }

    .post-summary a:hover {
      text-decoration: underline;
    }
  </style>
  <div class="post-summary">
    <h1>Check out the new post on "${topic}"</h1>
    <h4>${title}</h4>
    <p>${content}...</p>
    <a href="http://localhost:3000/">Read at the Blog</a>
  </div>`;

  var mailOptions = {
    from: "robertlewandowski9reus11@gmail.com",
    to: email,
    subject: "New post on subscribed topic " + topic,
    html: htmlTemplate,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

// Fetch Nearby Events (Restaurants, Music, Sports)
async function fetchEventsNearby(city) {
  try {
    const response = await axios.get("https://serpapi.com/search?engine=google_maps", {
      params: {
        api_key: SERPAPI_API_KEY,
        engine: "google",
        q: `restaurants in ${city}`,
        google_domain: "google.com",
        location: city,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Error fetching events nearby");
  }
}

async function fetchMusicalNearby(city) {
  try {
    const response = await axios.get("https://serpapi.com/search?engine=google_maps", {
      params: {
        api_key: SERPAPI_API_KEY,
        engine: "google",
        q: `musical/concert events in ${city}`,
        google_domain: "google.com",
        location: city,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Error fetching music events nearby");
  }
}

async function fetchSportsNearby(city) {
  try {
    const response = await axios.get("https://serpapi.com/search?engine=google_events", {
      params: {
        api_key: SERPAPI_API_KEY,
        engine: "google",
        q: `sports events in ${city}`,
        google_domain: "google.com",
        location: city,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Error fetching sports events nearby");
  }
}
app.post("/api/data", async (req, res) => {
  try {
    // Extract location data from request body
    const { location, weather } = req.body;

    // Process location data
    console.log("Location data:", location.city);
    const city = location.city;
    const latitude = location.latitude;
    const longitude = location.longitude;

    console.log(latitude + " " + longitude);
    // Fetch events nearby using SERPAPI
    const serpapiResponse = await fetchEventsNearby(city);
    // console.log(serpapiResponse.local_results[0]);

    const restaurantsDetails = serpapiResponse.local_results.map((rest) => {
      return {
        title: rest.title,
        gps_coordinates: rest.gps_coordinates,
        address: rest.address,
        open_state: rest.open_state,
        operating_hours: rest.operating_hours,
      };
    });
    // console.log(restaurantsDetails);
    let c = 0;
    const completions = [];
    const sr = [];
    for (const r of restaurantsDetails) {
      const message = [
        {
          role: "system",
          content:
            "you have to decide and recommend this restaurant or not based on the given location and weather. give the output has Yes or No",
        },
        {
          role: "user",
          content: `based on weather: ${weather.weather[0].main} and location: ${location.city}, this is the restaurant title: ${r.title}, with address: ${r.address}, and open state: ${r.open_state}?`,
        },
      ];
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-16k",
          messages: message,
          max_tokens: 20,
          temperature: 0.5,
          top_p: 1,
        });
        if (c == 3) {
          break;
        }
        if (response.choices[0].message.content == "Yes") {
          c++;
          completions.push(r);
        }
      } catch (error) {
        console.error("Error processing OpenAI completion:", error);
        completions.push(null);
      }
    }
    const serpapiResponsemusic = await fetchMusicalNearby(city);
    // console.log(serpapiResponsemusic.local_results);
    const musiceventDetails = serpapiResponsemusic.local_results.map((muse) => {
      return {
        title: muse.title,
        gps_coordinates: muse.gps_coordinates,
        address: muse.address,
        open_state: muse.open_state,
        description: muse.description,
        operating_hours: muse.operating_hours,
      };
    });
    // console.log(musiceventDetails);
    let c2 = 0;
    const completion2 = [];
    for (const r of musiceventDetails) {
      const message = [
        {
          role: "system",
          content:
            "you have to decide and recommend this musical/concert event or not based on the given location and weather. give the output has Yes or No. If open_state is undefined please say an immediate NO. please be liberal and say yes easily for now",
        },
        {
          role: "user",
          content: `based on weather: ${weather.weather[0].main} and location: ${location.city}, this is the restaurant title: ${r.title}, with address: ${r.address} and open state: ${r.open_state}?`,
        },
      ];
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-16k",
          messages: message,
          max_tokens: 20,
          temperature: 0.5,
          top_p: 1,
        });
        console.log(response.choices[0].message.content);
        if (c2 == 3) {
          break;
        }
        if (response.choices[0].message.content.includes("Yes")) {
          c2++;
          completion2.push(r);
        }
      } catch (error) {
        console.error("Error processing OpenAI completion:", error);
        completion2.push(null);
      }
    }
    // console.log(completion2);
    const serpapiResponsesports = await fetchSportsNearby(city);
    // console.log(serpapiResponsesports.events_results[0]);
    const sporteventDetails = serpapiResponsesports.events_results.map(
      (sport) => {
        return {
          title: sport.title,
          date: sport.date,
          address: sport.address,
          link: sport.link,
          description: sport.description,
        };
      }
    );
    console.log(sporteventDetails);
    const sportsDetailswithLocation = [];
    for (const sport of sporteventDetails) {
      const gps_coordinates = await geocodeAddress(sport.address);
      sportsDetailswithLocation.push({ sport, gps_coordinates });
    }
    console.log(sportsDetailswithLocation);
    let c3 = 0;
    const completion3 = [];
    let notedAddresses = [];
    for (const s of sportsDetailswithLocation) {
      let difference = 0.0;
      if (notedAddresses.includes(s.sport.address[0])) {
        difference = 0.001;
      }
      const message = [
        {
          role: "system",
          content:
            "you have to decide and recommend this sport event or not based on the given location and weather. give the output has Yes or No. Be liberal say Yes easily",
        },
        {
          role: "user",
          content: `based on weather: ${weather.weather[0].main} and location: ${location.city}, this is the sport title: ${s.title}?`,
        },
      ];
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-16k",
          messages: message,
          max_tokens: 20,
          temperature: 0.5,
          top_p: 1,
        });
        console.log(response.choices[0].message.content);
        if (c3 == 3) {
          break;
        }
        if (response.choices[0].message.content.includes("Yes")) {
          c3++;
          s.gps_coordinates.latitude += difference;
          notedAddresses.push(s.sport.address[0]);
          completion3.push(s);
        }
      } catch (error) {
        console.error("Error processing OpenAI completion:", error);
        completion3.push(null);
      }
    }
    console.log(completion3);
    res.json({ completions, completion2, sr, completion3 });
  } catch (error) {
    console.error("Error processing data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Start the Express server
const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

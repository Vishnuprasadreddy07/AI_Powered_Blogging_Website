class User {
  constructor(id, name, email, status, type, password) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.status = status;
    this.type = type;
    this.password = password;
    this.state = []; // initialize local state in the instance
  }

  parseData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      this.state = data.map(
        (user) =>
          new User(
            user.id,
            user.name,
            user.email,
            user.status,
            user.type,
            user.password
          )
      );
    } catch (error) {
      console.error("Error parsing data:", error);
    }
  };

  getUsers = () => {
    return this.state;
  };
}

export default User;

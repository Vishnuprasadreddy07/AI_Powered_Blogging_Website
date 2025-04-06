import React from "react";
import Data from "../../Data.json";

class User {
  constructor(id, name, email, status, type, password) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.status = status;
    this.type = type;
    this.password = password;
  }

  parseData = async () => {
    for (let i = 0; i < Data.length; i++) {
      this.state.push(Data[i]);
    }
  };

  getUsers = () => {
    const users = [];
    for (let i = 0; i < Data.length; i++) {
      users.push(
        new User(
          Data[i].id,
          Data[i].name,
          Data[i].email,
          Data[i].status,
          Data[i].type,
          Data[i].password
        )
      );
    }
    return users;
  };
}

export default User;

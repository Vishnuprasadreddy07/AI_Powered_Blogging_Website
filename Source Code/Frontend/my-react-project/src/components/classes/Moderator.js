import User from "./User";
import moderator from "../../Moderator.json";
class Moderator extends User {
  constructor() {
    super();
    this.state = [];
  }
  parseData = async () => {
    for (let i = 0; i < moderator.length; i++) {
      this.state.push(moderator[i]);
    }
  };
  getmoderator = () => {
    this.parseData();
    return this.state;
  };

  getMajor = () => {
    return;
  };
}

export default Moderator;

import User from "./User";
import student from "../../Student.json";
class Student extends User {
  constructor() {
    super();
    this.state = [];
  }
  parseData = async () => {
    for (let i = 0; i < student.length; i++) {
      this.state.push(student[i]);
    }
  };
  getStudents = () => {
    this.parseData();
    return this.state;
  };

  getMajor = () => {
    return;
  };
}

export default Student;

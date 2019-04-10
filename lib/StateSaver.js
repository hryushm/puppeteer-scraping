const fs = require("fs");

class StateSaver {
  constructor(path) {
    this.stateJsonPath = path;
  }

  getState() {
    let state = {};
    try {
      state = JSON.parse(fs.readFileSync(this.stateJsonPath));
    } catch (error) {
      console.log(error);
      state = [];
    }
    console.log(state);
    return state;
  }

  saveState(state) {
    try {
      fs.writeFileSync(this.stateJsonPath, JSON.stringify(state));
    } catch (error) {
      throw error;
    }
  }

  isSameState(state) {
    const currentState = this.getState();
    // This works because state is String[]
    return JSON.stringify(currentState) === JSON.stringify(state);
  }
}
module.exports = StateSaver;

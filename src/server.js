const app = require("./app");
const config = require("./config/config");

const server = app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});

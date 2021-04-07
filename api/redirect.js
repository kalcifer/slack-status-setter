const axios = require("axios");
const FormData = require("form-data");
const { WebClient, LogLevel } = require("@slack/web-api");

module.exports = async (req, res) => {
  const { query } = req;
  const { state, code } = query;

  if (state !== "pks-slack-button") {
    console.error("state did not match, aborting");
    res.json({
      success: false,
      payload: null,
      error: "request appears frauduelent",
    });
    return;
  }
  console.log("state matched, continuing");

  const formData = new FormData();
  formData.append("code", code);
  formData.append("client_id", process.env.SLACK_STATUS_SETTER_CLIENT_ID);
  formData.append(
    "client_secret",
    process.env.SLACK_STATUS_SETTER_CLIENT_SECRET
  );

  try {
    console.log("POSTing to slack api (oauth.v2.access)");
    const payload = await axios.post(
      "https://slack.com/api/oauth.v2.access",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );
    console.log("successful response!");
    const token = payload.data.access_token;
    const client = new WebClient(token, {
      // LogLevel can be imported and used to make debugging simpler
      logLevel: LogLevel.DEBUG,
    });
    // https://eggheadio.slack.com/archives/C030CS0RL/p1613379294013000
    const conversation = await app.client.conversations.history({
      // The token you used to initialize your app
      token,
      channel: "C030CS0RL",
      // In a more realistic app, you may store ts data in a db
      latest: "p1613379294013000",
      // Limit results
      inclusive: true,
      limit: 1,
    });
    res.json({ success: true, payload: conversation });
  } catch (err) {
    console.error(err);
    res.json({ success: false, payload: null, error: err });
  }
};

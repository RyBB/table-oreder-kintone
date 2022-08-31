const { KintoneRestAPIClient } = require("@kintone/rest-api-client");

const kinClient = new KintoneRestAPIClient({
  baseUrl: `https://${process.env.KN_DOMAIN}`,
  auth: {
    apiToken: process.env.KN_USER_APITOKEN,
  },
});
const callback = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ body }),
  };
};

exports.handler = async (event) => {
  try {
    const res = JSON.parse(event.body);
    const line_userId = res.user_id;
    const line_userName = res.user_name;

    // すでに登録されているかチェック
    const resp = await kinClient.record.getRecords({
      app: process.env.KN_USER_APPID,
      query: `LINE_ID = "${line_userId}"`,
    });
    // すでに登録されていたら無視
    if (resp.records.length !== 0) return;

    await kinClient.record.addRecord({
      app: process.env.KN_USER_APPID,
      record: {
        LINE_ID: {
          value: line_userId,
        },
        LINEアカウント名: {
          value: line_userName,
        },
      },
    });
    return callback(200, { message: "success" });
  } catch (err) {
    console.error(err);
    return callback(500, { message: "error", error: err });
  }
};

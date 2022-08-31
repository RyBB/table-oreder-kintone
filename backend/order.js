const { KintoneRestAPIClient } = require("@kintone/rest-api-client");

const kinClient = new KintoneRestAPIClient({
  baseUrl: `https://${process.env.KN_DOMAIN}`,
  auth: {
    apiToken: `${process.env.KN_ORDER_APITOKEN}, ${process.env.KN_USER_APITOKEN}, ${process.env.KN_ITEMLIST_APITOKEN}`,
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
    console.log(res);

    if (res.values) {
      const records = res.values.map((val) => {
        return {
          座席番号: {
            value: val.table_id,
          },
          LINEアカウント検索: {
            value: val.user_id,
          },
          商品検索: {
            value: val.item_name,
          },
          注文数: {
            value: val.item_amount,
          },
        };
      });
      await kinClient.record.addRecords({
        app: process.env.KN_ORDER_APPID,
        records,
      });
    }
    return callback(200, { message: "success" });
  } catch (err) {
    console.error(err);
    return callback(500, { message: "error", error: err });
  }
};

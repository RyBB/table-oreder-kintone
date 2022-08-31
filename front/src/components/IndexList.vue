<template>
  <div>
    <div class="timer">
      <div>{{ nowDate }}</div>
      <div>{{ nowTime }}</div>
    </div>
    <div class="hr">
      <hr />
    </div>
    <table class="order-list">
      <thead>
        <tr>
          <th></th>
          <th>経過時間</th>
          <th>商品名</th>
          <th>数量</th>
          <th>お客様名</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(record, index) in records" :key="record.$id.value">
          <td>
            <button
              class="status-btn"
              v-on:click="serveItem(index, record.$id.value)"
            >
              提供
            </button>
            <button
              class="delay-btn"
              v-on:click="delayItem(index, record.$id.value)"
            >
              遅延
            </button>
          </td>
          <td>
            <div>
              {{ setDiffTime(record["作成日時"].value) }}
            </div>
          </td>
          <td>
            <div>{{ record.商品名.value }}</div>
          </td>
          <td>
            <div>{{ record.注文数.value }}</div>
          </td>
          <td>
            <div>{{ record.LINEアカウント名.value }}</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import dayjs from "dayjs";
dayjs.extend(require("dayjs/plugin/timezone"));
dayjs.extend(require("dayjs/plugin/utc"));
dayjs.tz.setDefault("Asia/Tokyo");

const client = new KintoneRestAPIClient();
export default {
  name: "IndexList",
  data() {
    return {
      appId: 125,
      nowDate: "",
      nowTime: "",
      lineUrl: "https://api.line.me/v2/bot/message/push",
      header: {
        "Content-Type": "application/json",
        Authorization: "Bearer XXXXXXXXXX",
      },
    };
  },
  async mounted() {
    const now = new dayjs();
    this.nowDate = now.format("YYYY/MM/DD");
    this.nowTime = now.format("hh:mm:ss");
    setInterval(this.setTimer, 500);
    const resp = await client.record.getRecords({
      app: this.appId,
      query: `状況 in ("対応中") order by $id asc`,
    });
    console.log(resp);
    this.records = resp.records;
  },
  computed: {
    setDiffTime() {
      return (createdTime) => {
        const now = dayjs();
        return dayjs(now.diff(createdTime)).format("hh:mm:ss");
      };
    },
  },
  methods: {
    setTimer() {
      const now = new dayjs();
      this.nowTime = now.format("hh:mm:ss");
    },
    async serveItem(i, id) {
      await client.record.updateRecord({
        app: this.appId,
        id,
        record: {
          状況: {
            value: "提供済み",
          },
        },
      });
      await kintone.proxy(this.lineUrl, "POST", this.header, {
        to: this.records[i]["LINE_ID"].value,
        messages: [
          {
            type: "text",
            text: `お待たせしました！ただいま商品をお持ちいたします。`,
          },
        ],
      });
      this.records.splice(i, 1);
    },
    async delayItem(id) {
      const line_id = this.records[id]["LINE_ID"].value;

      await kintone.proxy(this.lineUrl, "POST", this.header, {
        to: line_id,
        messages: [
          {
            type: "text",
            text: `ただいま多くの注文を頂いておりまして、料理の提供が遅れております。お時間頂戴して大変申し訳ございません。`,
          },
          {
            type: "text",
            text: `ご提供が遅れる商品: ${this.records[id]["商品名"].value}`,
          },
        ],
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.timer {
  font-size: 3rem;
  font-weight: bold;
  color: #b44c4c;
}
.hr {
  border-top: 4px solid #b44c4c;
  border-right: none;
  border-bottom: none;
  border-left: none;
  margin: 20px 0 50px 0;
}
.order-list {
  margin: auto;
  width: 80vw;
  font-size: 1.5rem;
  text-align: center;
  border: 1px solid #000;
}
th {
  color: #b44c4c;
  width: 30%;
}
.order-list th,
.order-list td {
  border: 1px solid #000;
}
.status-btn {
  border-radius: 50%;
  line-height: 100px;
  width: 100px;
  height: 100px;
  padding: 0;
  color: #fff;
  background-color: #00bceb;
  font-size: 2rem;
  margin: 0 10px;
}
.delay-btn {
  border-radius: 50%;
  line-height: 100px;
  width: 100px;
  height: 100px;
  padding: 0;
  color: #fff;
  background-color: #eb6100;
  font-size: 2rem;
  margin: 0 10px;
}
</style>

<template>
  <IndexList />
</template>

<script>
import IndexList from "./components/IndexList.vue";

export default {
  name: "App",
  components: {
    IndexList,
  },
};
</script>

<style>
body {
  background-color: #fff;
}
#app {
  height: 100vh;
  width: 100vw;
  text-align: center;
  color: #2c3e50;
}
</style>

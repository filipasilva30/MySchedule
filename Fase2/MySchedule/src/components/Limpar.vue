<template>
  <button class="limpar-button">
    <i class="trash-icon"></i> Limpar
  </button>
</template>

<script>
export default {
  name: "LimparButton"
};
</script>

<style scoped>
.limpar-button {
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.limpar-button:hover {
  background-color: #f0f0f0;
}

.trash-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  background-color: red;
  clip-path: url(#trash-icon);
}

svg {
  display: none;
}
</style>

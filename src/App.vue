<template>
  <header class="topnav">
    <router-link to="/cards" class="brand">瀑布流 H5</router-link>
    <nav class="links">
      <router-link to="/cards">卡片流</router-link>
      <router-link to="/swipe">滑动列表</router-link>
    </nav>
  </header>
  <router-view />
</template>

<style scoped>
.topnav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.brand {
  font-weight: 600;
  color: var(--text-h);
  text-decoration: none;
}

.links {
  display: flex;
  gap: 8px;
}

.links a {
  color: var(--text);
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
}

.links a.router-link-active {
  color: var(--accent);
  background: var(--accent-bg);
}
</style>

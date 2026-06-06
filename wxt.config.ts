import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: ".",
  manifest: {
    name: "Catnooish Quest",
    description: "A BuildClub Claude Code course mascot that turns lessons into build quests.",
    version: "0.1.0",
    permissions: ["activeTab", "storage", "sidePanel", "tabs"],
    host_permissions: ["<all_urls>"],
    action: {
      default_title: "Open Catnooish Quest"
    },
    side_panel: {
      default_path: "sidepanel.html"
    }
  }
});

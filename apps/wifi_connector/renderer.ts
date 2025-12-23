import "../../tools/index.css";
import { initKeyboard } from "../../tools/utils/keyboard";

console.log("WiFi Connector app loaded");

// Initialize keyboard when DOM is ready
async function init() {
  try {
    // Initialize onscreen keyboard with target inputs
    await initKeyboard(
      "#simple-keyboard",
      "#ssid-input",
      "#password-input"
    );
    console.log("WiFi Connector initialized successfully");
  } catch (error) {
    console.error("Failed to initialize WiFi Connector:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

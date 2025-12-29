import "../../tools/index.css";
import { initKeyboard } from "../../tools/utils/keyboard";
import type { WiFiNetwork } from "../../types/api";

console.log("WiFi Connector app loaded");

let availableNetworks: WiFiNetwork[] = [];

// Show message to user
function showMessage(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const messageSection = document.getElementById('message-section');
  if (!messageSection) return;

  const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-info';
  messageSection.innerHTML = `
    <div class="alert ${alertClass}">
      <span>${message}</span>
    </div>
  `;

  // Auto-clear after 5 seconds for success/info messages
  if (type !== 'error') {
    setTimeout(() => {
      messageSection.innerHTML = '';
    }, 5000);
  }
}

// Update connection status display
async function updateConnectionStatus() {
  const statusDiv = document.getElementById('connection-status');
  if (!statusDiv) return;

  try {
    const status = await window.wifiAPI.getCurrentConnection();

    if (status.connected && status.ssid) {
      const signalInfo = status.signal ? ` (Signal: ${status.signal}%)` : '';
      statusDiv.innerHTML = `
        <div class="alert alert-success">
          <span>Connected to: <strong>${status.ssid}</strong>${signalInfo}</span>
        </div>
      `;
    } else {
      statusDiv.innerHTML = `
        <div class="alert alert-warning">
          <span>Not connected to any network</span>
        </div>
      `;
    }
  } catch (error) {
    console.error("Failed to get connection status:", error);
    statusDiv.innerHTML = `
      <div class="alert alert-error">
        <span>Failed to get connection status: ${error instanceof Error ? error.message : String(error)}</span>
      </div>
    `;
  }
}

// Load available WiFi networks
async function loadNetworks() {
  const networkSelect = document.getElementById('network-select') as HTMLSelectElement;
  const refreshBtn = document.getElementById('refresh-networks-btn') as HTMLButtonElement;

  if (!networkSelect || !refreshBtn) return;

  try {
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Scanning...';
    networkSelect.disabled = true;
    networkSelect.innerHTML = '<option disabled selected>Scanning for networks...</option>';

    availableNetworks = await window.wifiAPI.listAvailableNetworks();

    if (availableNetworks.length === 0) {
      networkSelect.innerHTML = '<option disabled selected>No networks found</option>';
      showMessage('No WiFi networks found. Please try again.', 'info');
      return;
    }

    // Populate dropdown with networks
    networkSelect.innerHTML = '<option disabled selected>Select a network</option>';

    availableNetworks.forEach((network, index) => {
      const option = document.createElement('option');
      option.value = index.toString();

      // Format: SSID (Signal: 85%) [WPA2]
      const signalBars = network.signal >= 75 ? '▂▄▆█' :
                         network.signal >= 50 ? '▂▄▆' :
                         network.signal >= 25 ? '▂▄' : '▂';

      option.textContent = `${signalBars} ${network.ssid} (${network.signal}%) [${network.security}]`;
      networkSelect.appendChild(option);
    });

    networkSelect.disabled = false;
    showMessage(`Found ${availableNetworks.length} network(s)`, 'success');

  } catch (error) {
    console.error("Failed to load networks:", error);
    networkSelect.innerHTML = '<option disabled selected>Error loading networks</option>';
    showMessage(`Failed to scan networks: ${error instanceof Error ? error.message : String(error)}`, 'error');
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Refresh Networks';
  }
}

// Connect to selected network
async function connectToNetwork() {
  const networkSelect = document.getElementById('network-select') as HTMLSelectElement;
  const passwordInput = document.getElementById('password-input') as HTMLInputElement;
  const autoconnectCheckbox = document.getElementById('autoconnect-checkbox') as HTMLInputElement;
  const connectBtn = document.getElementById('connect-btn') as HTMLButtonElement;

  if (!networkSelect || !passwordInput || !autoconnectCheckbox || !connectBtn) return;

  const selectedIndex = parseInt(networkSelect.value);
  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= availableNetworks.length) {
    showMessage('Please select a network first', 'error');
    return;
  }

  const selectedNetwork = availableNetworks[selectedIndex];
  const password = passwordInput.value;
  const autoconnect = autoconnectCheckbox.checked;

  // Check if password is needed for secured networks
  if (selectedNetwork.security !== 'Open' && !password) {
    showMessage('Password required for secured networks', 'error');
    return;
  }

  try {
    connectBtn.disabled = true;
    connectBtn.textContent = 'Connecting...';

    await window.wifiAPI.connect({
      ssid: selectedNetwork.ssid,
      password: password,
      autoconnect: autoconnect
    });

    showMessage(`Successfully connected to ${selectedNetwork.ssid}`, 'success');
    passwordInput.value = ''; // Clear password

    // Update connection status
    await updateConnectionStatus();

  } catch (error) {
    console.error("Failed to connect:", error);
    showMessage(`Failed to connect: ${error instanceof Error ? error.message : String(error)}`, 'error');
  } finally {
    connectBtn.disabled = false;
    connectBtn.textContent = 'Connect to WiFi';
  }
}

// Disconnect from current network
async function disconnect() {
  const disconnectBtn = document.getElementById('disconnect-btn') as HTMLButtonElement;
  if (!disconnectBtn) return;

  try {
    disconnectBtn.disabled = true;
    disconnectBtn.textContent = 'Disconnecting...';

    await window.wifiAPI.disconnect();
    showMessage('Successfully disconnected from WiFi', 'success');

    // Update connection status
    await updateConnectionStatus();

  } catch (error) {
    console.error("Failed to disconnect:", error);
    showMessage(`Failed to disconnect: ${error instanceof Error ? error.message : String(error)}`, 'error');
  } finally {
    disconnectBtn.disabled = false;
    disconnectBtn.textContent = 'Disconnect';
  }
}

// Initialize keyboard when DOM is ready
async function init() {
  try {
    // Initialize onscreen keyboard with password input
    await initKeyboard(
      "#simple-keyboard",
      "#password-input"
    );

    // Set up event listeners
    const refreshBtn = document.getElementById('refresh-networks-btn');
    const connectBtn = document.getElementById('connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', loadNetworks);
    }

    if (connectBtn) {
      connectBtn.addEventListener('click', connectToNetwork);
    }

    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', disconnect);
    }

    // Initial load
    await updateConnectionStatus();
    await loadNetworks();

    console.log("WiFi Connector initialized successfully");
  } catch (error) {
    console.error("Failed to initialize WiFi Connector:", error);
    showMessage(`Initialization error: ${error instanceof Error ? error.message : String(error)}`, 'error');
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

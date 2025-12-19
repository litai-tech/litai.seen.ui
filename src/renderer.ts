import "./index.css";
import { AppInfo } from "./types";

/**
 * Formats app name for display (converts underscores and handles spaces)
 */
function formatAppName(name: string): string {
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Creates an app card element
 */
function createAppCard(app: AppInfo): HTMLElement {
  const card = document.createElement("div");
  card.className = "card bg-base-100 shadow-xl";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const title = document.createElement("h2");
  title.className = "card-title text-2xl mb-4";
  title.textContent = formatAppName(app.name);

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "form-control mb-4";

  const label = document.createElement("label");
  label.className = "label cursor-pointer justify-start gap-3";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "checkbox checkbox-primary";
  checkbox.id = `devtools-${app.name}`;

  const labelText = document.createElement("span");
  labelText.className = "label-text text-base";
  labelText.textContent = "Open DevTools";

  label.appendChild(checkbox);
  label.appendChild(labelText);
  checkboxContainer.appendChild(label);

  const actions = document.createElement("div");
  actions.className = "card-actions justify-end mt-4";

  const launchButton = document.createElement("button");
  launchButton.className = "btn btn-primary btn-block";
  launchButton.textContent = "Launch";
  launchButton.onclick = () => {
    const openDevTools = checkbox.checked;
    window.appAPI.loadApp(app.name, openDevTools);
  };

  actions.appendChild(launchButton);

  cardBody.appendChild(title);
  cardBody.appendChild(checkboxContainer);
  cardBody.appendChild(actions);
  card.appendChild(cardBody);

  return card;
}

/**
 * Loads and displays available apps
 */
async function loadApps(): Promise<void> {
  const appList = document.getElementById("app-list");
  const loading = document.getElementById("loading");
  const noApps = document.getElementById("no-apps");

  if (!appList || !loading || !noApps) {
    console.error("Required DOM elements not found");
    return;
  }

  try {
    const apps = await window.appAPI.getAvailableApps();

    // Hide loading
    loading.classList.add("hidden");

    if (apps.length === 0) {
      // Show no apps message
      noApps.classList.remove("hidden");
      appList.classList.add("hidden");
    } else {
      // Display apps
      appList.classList.remove("hidden");
      apps.forEach((app) => {
        const card = createAppCard(app);
        appList.appendChild(card);
      });
    }
  } catch (error) {
    console.error("Error loading apps:", error);
    loading.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl mb-4">⚠️</div>
        <h2 class="text-2xl font-bold mb-2 text-error">Error Loading Applications</h2>
        <p class="text-base-content/70">${error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    `;
  }
}

// Load apps when the page loads
loadApps();

const localIp = await window.systemAPI.getLocalIp();
const localIpElement = document.getElementById("localIpSpan");
if(localIpElement)
  localIpElement.innerText = localIp ?? "";
const getEnv = (key, fallback) => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

const API_URL = getEnv("API_URL", "http://localhost:3000");
const NODE_ENV = getEnv("NODE_ENV", "development");

class LoadingApp {
  constructor() {
    this.modal = null;
    this.reloadBtn = null;
    this.init();
  }

  init() {
    this.modal = document.getElementById("modal");
    this.reloadBtn = document.getElementById("reloadBtn");
    if (this.reloadBtn) {
      this.reloadBtn.addEventListener("click", () => this.loadData());
    }

    if (NODE_ENV === "production") {
      this.registerServiceWorker();
    }
    this.setupOfflineHandling();
    this.loadData();
  }

  async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration =
          await navigator.serviceWorker.register("/service.worker.js");
        console.log("Service Worker registered:", registration);
      } catch (error) {
        console.log(
          "Service Worker registration failed (expected in dev):",
          error,
        );
      }
    }
  }

  setupOfflineHandling() {
    window.addEventListener("online", () => {
      this.hideOfflineMessage();
      this.loadData();
    });

    window.addEventListener("offline", () => {
      this.showOfflineMessage();
    });

    if (!navigator.onLine) {
      this.showOfflineMessage();
    }
  }

  showSkeleton() {
    const list = document.getElementById("newsList");
    if (!list) return;

    list.innerHTML = `
      <div class="news-item">
        <div class="news-thumb skeleton"></div>
        <div class="news-text">
          <div class="line line-short skeleton"></div>
          <div class="line skeleton"></div>
          <div class="line skeleton"></div>
        </div>
      </div>
      <div class="news-item">
        <div class="news-thumb skeleton"></div>
        <div class="news-text">
          <div class="line line-short skeleton"></div>
          <div class="line skeleton"></div>
          <div class="line skeleton"></div>
        </div>
      </div>
      <div class="news-item">
        <div class="news-thumb skeleton"></div>
        <div class="news-text">
          <div class="line line-short skeleton"></div>
          <div class="line skeleton"></div>
          <div class="line skeleton"></div>
        </div>
      </div>
    `;
    this.hideModal();
  }

  async loadData() {
    this.showSkeleton();
    console.log("Loading data from:", `${API_URL}/api/data`);
    try {
      const response = await fetch(`${API_URL}/api/data`);
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Received data:", data);
      this.showContent(data);
    } catch (error) {
      console.error("Error loading data:", error);
      if (!navigator.onLine) {
        this.showOfflineMessage();
      } else {
        this.showError();
      }
    }
  }

  showLoading() {
    this.hideModal();
  }

  showContent(data) {
    console.log("showContent called with:", data);
    const list = document.getElementById("newsList");
    if (!list) {
      console.error("newsList element not found");
      return;
    }

    if (data?.data?.items && Array.isArray(data.data.items)) {
      console.log("Rendering", data.data.items.length, "items");
      list.innerHTML = "";

      data.data.items.forEach((item) => {
        const newsItem = document.createElement("div");
        newsItem.className = "news-item";

        const thumb = document.createElement("div");
        thumb.className = "news-thumb";

        const text = document.createElement("div");
        text.className = "news-text";

        const title = document.createElement("div");
        title.className = "news-title";
        title.textContent = item.title;

        const desc = document.createElement("div");
        desc.className = "news-desc";
        desc.textContent = item.description;

        text.appendChild(title);
        text.appendChild(desc);
        newsItem.appendChild(thumb);
        newsItem.appendChild(text);

        list.appendChild(newsItem);
      });
    } else {
      console.error("Invalid data structure:", data);
    }

    this.hideModal();
  }

  showError() {
    this.setModalContent(
      `
      <div class="modal-body">
        <p>Не удалось получить данные</p>
        <p>Проверьте подключение и обновите страницу</p>
      </div>
      <div class="modal-actions">
        <button class="reload-btn" data-modal-reload>Обновить</button>
      </div>
    `,
      true,
    );
  }

  showOfflineMessage() {
    this.setModalContent(
      `
      <div class="modal-body">
        <p>Нет подключения</p>
        <p>Проверьте подключение и обновите страницу</p>
      </div>
      <div class="modal-actions">
        <button class="reload-btn" data-modal-reload>Обновить</button>
      </div>
    `,
      true,
    );
  }

  hideOfflineMessage() {
    this.hideModal();
  }

  setModalContent(innerHtml, withReloadButton) {
    if (!this.modal) return;

    this.modal.classList.add("visible");
    this.modal.innerHTML = `
      <div class="modal">
        ${innerHtml}
      </div>
    `;

    if (withReloadButton) {
      const btn = this.modal.querySelector("[data-modal-reload]");
      if (btn) {
        btn.addEventListener("click", () => {
          this.hideModal();
          this.loadData();
        });
      }
    }
  }

  hideModal() {
    if (!this.modal) return;
    this.modal.classList.remove("visible");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new LoadingApp();
});

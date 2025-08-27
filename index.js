document.addEventListener("DOMContentLoaded", () => {
  // Загружаем посты
  fetch("./data/posts.json")
    .then(r => r.json())
    .then(posts => {
      renderPosts(posts);
      handleHash(posts, 'posts');
    })
    .catch(err => console.error("Ошибка загрузки постов:", err));

  // Загружаем анонсы
  fetch("./data/announce.json")
    .then(r => r.json())
    .then(announces => {
      renderAnnounces(announces);
      handleHash(announces, 'announces');
    })
    .catch(err => console.error("Ошибка загрузки анонсов:", err));
});

// Функция для обработки хэша в URL
function handleHash(items, type) {
  const hash = window.location.hash;
  if (hash.startsWith(`#${type}-`)) {
    const id = parseInt(hash.slice(`#${type}-`.length));
    const item = items.find(p => p.id === id);
    if (item) {
      openModal(item);
    }
  }
}

// === РЕНДЕР ПОСТОВ ===
async function renderPosts(posts) {
  const root = document.getElementById("posts-preview");
  if (!root) return;

  root.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "posts-grid";

  for (const post of posts.reverse()) {
    let thumb = "";

    // imgur
    if (post.image && post.image.includes("imgur.com")) {
      const m = post.image.match(/\/([a-zA-Z0-9]+)$/);
      if (m && m[1]) {
        const imgUrl = `https://i.imgur.com/${m[1]}.jpg`;
        if (await imageExists(imgUrl)) thumb = imgUrl;
      }
    }

    // vimeo
    if (!thumb && post.video) {
      try {
        const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(post.video)}`;
        const res = await fetch(oembedUrl);
        if (res.ok) thumb = (await res.json()).thumbnail_url;
      } catch {}
    }

    const article = document.createElement("article");
    article.className = "post-card";
    article.dataset.postId = post.id;

    article.innerHTML = `
      ${thumb ? `<img class="post-thumb" src="${thumb}" alt="">` : ""}
      <div class="post-body">
        <h4 class="post-title">${post.title}</h4>
        <p class="post-excerpt">${post.excerpt || ""}</p>
      </div>
      <div class="post-actions">
      <!--<a class="view" href="posts.html#post-${post.id}">Открыть</a>-->
        <a class="share" href="#">Поделиться</a>
      <!--</div>-->
    `;

    // Добавляем обработчик для кнопки "Поделиться"
    const shareLink = article.querySelector(".share");
    shareLink.addEventListener("click", (e) => {
      e.preventDefault();
      const url = `https://luxsarba.github.io/Snegovok/#posts-${post.id}`;
      navigator.clipboard.writeText(url)
        .then(() => {
          const originalText = shareLink.textContent;
          shareLink.textContent = "Скопировано!";
          setTimeout(() => {
            shareLink.textContent = originalText;
          }, 2000);
        })
        .catch(err => {
          console.error("Не удалось скопировать ссылку:", err);
        });
    });

    // клики по карточке
    article.addEventListener("click", (e) => {
      // если клик по ссылке — не открываем модалку
      if (e.target.tagName.toLowerCase() === "a") return;
      openModal(post);
    });

    wrapper.appendChild(article);
  }

  root.appendChild(wrapper);
}

// === РЕНДЕР АНОНСОВ ===
function renderAnnounces(announces) {
  const announceContainer = document.getElementById("announce-preview");
  if (!announceContainer) return;

  announceContainer.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "announce-list";

  announces.reverse().forEach(async post => {
    let thumb = "";

    // imgur
    if (post.image && post.image.includes("imgur.com")) {
      const match = post.image.match(/\/([a-zA-Z0-9]+)$/);
      if (match && match[1]) {
        const imgId = match[1];
        const imgUrl = `https://i.imgur.com/${imgId}.jpg`;
        if (await imageExists(imgUrl)) thumb = imgUrl;
      }
    }

    // vimeo
    if (!thumb && post.video) {
      try {
        const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(post.video)}`;
        const response = await fetch(oembedUrl);
        if (response.ok) {
          const data = await response.json();
          thumb = data.thumbnail_url;
        }
      } catch (err) {
        console.warn("Не удалось получить превью с Vimeo:", err);
      }
    }

    const item = document.createElement("div");
    item.className = "announce-item";
    item.dataset.postId = post.id;

    item.innerHTML = `
      ${thumb ? `<img src="${thumb}" alt="preview">` : ""}
      <div>
        <div class="li-text">${post.title}</div>
        <div class="li-meta">${post.date}</div>
      </div>
    `;

    item.addEventListener("click", () => openModal(post));

    wrapper.appendChild(item);
  });

  announceContainer.appendChild(wrapper);
}

// === ОБЩАЯ ФУНКЦИЯ ДЛЯ МОДАЛКИ ===
async function openModal(post) {
  let modalImage = post.image;
  if (post.image && post.image.includes("imgur.com")) {
    const m = post.image.match(/\/([a-zA-Z0-9]+)$/);
    if (m && m[1]) {
      const imgUrl = `https://i.imgur.com/${m[1]}.jpg`;
      if (await imageExists(imgUrl)) modalImage = imgUrl;
    }
  }

  const modal = document.createElement("div");
  modal.className = "post-modal-overlay";
  modal.innerHTML = `
    <div class="post-modal">
      <button class="close-modal">&times;</button>
      <h2 class="modal-title">${post.title}</h2>
      <p class="modal-date">${post.date}</p>
      ${modalImage ? `<img class="modal-image" src="${modalImage}" alt="${post.title}">` : ""}
      ${post.video ? `<div class="video-wrapper"><iframe class="modal-video" src="${post.video}" frameborder="0" allow="fullscreen"></iframe></div>` : ""}
      <p class="modal-description">${post.description || ""}</p>
      ${post.tags && post.tags.length ? `
        <div class="modal-tags">
          <strong>Теги:</strong> ${post.tags.join(", ")}
        </div>
      ` : ""}
    </div>
  `;

  document.body.appendChild(modal);

  // Закрытие по кнопке
  modal.querySelector(".close-modal").addEventListener("click", () => closeModal(modal));

  // Закрытие по клику вне модалки
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(modal);
  });

  // Закрытие по ESC
  const escHandler = (e) => {
    if (e.key === "Escape") {
      closeModal(modal);
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);
}

function closeModal(modal) {
  modal.remove();
}

// === ВСПОМОГАТЕЛЬНАЯ ===
async function imageExists(url) {
  try {
    const r = await fetch(url, { method: "HEAD" });
    return r.ok;
  } catch {
    return false;
  }
}
fetch("./posts.json")
  .then(response => response.json())
  .then(data => renderLatestPosts(data))
  .catch(error => console.error("Ошибка загрузки постов:", error));

function renderLatestPosts(posts) {
  const latestPostsContainer = document.getElementById("latest-posts-preview");
  if (!latestPostsContainer) return;

  const latest = posts.slice(0, 5);

  latest.forEach(async post => {
    const postLink = document.createElement("a");
    postLink.href = `posts.html#post-${post.id}`;
    postLink.className = "post-preview";
    postLink.style.textDecoration = "none";
    postLink.style.color = "inherit";

    const postDiv = document.createElement("div");
    postDiv.style.marginBottom = "1.5em";
    postDiv.style.border = "1px solid #ccc";
    postDiv.style.borderRadius = "8px";
    postDiv.style.padding = "1em";
    postDiv.style.backgroundColor = "#f9f9f9";
    postDiv.style.display = "flex";
    postDiv.style.alignItems = "center";
    postDiv.style.gap = "1em";
    postDiv.style.transition = "transform 0.2s";
    postDiv.onmouseenter = () => postDiv.style.transform = "scale(1.02)";
    postDiv.onmouseleave = () => postDiv.style.transform = "scale(1)";

    let mediaHTML = "";
    let hasImage = false;

    // Imgur
    if (post.image && post.image.includes("imgur.com")) {
      const match = post.image.match(/\/([a-zA-Z0-9]+)$/);
      if (match && match[1]) {
        const imgId = match[1];
        const imgUrl = `https://i.imgur.com/${imgId}.jpg`;
        if (await imageExists(imgUrl)) {
          mediaHTML = `<img src="${imgUrl}" alt="Превью" style="width: 100px; height: auto; border-radius: 6px;" />`;
          hasImage = true;
        }
      }
    }

    // Если нет изображения — получаем Vimeo thumbnail
    if (!hasImage && post.video) {
      try {
        const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(post.video)}`;
        const response = await fetch(oembedUrl);
        if (response.ok) {
          const data = await response.json();
          const thumbUrl = data.thumbnail_url;
          mediaHTML = `<img src="${thumbUrl}" alt="Видео превью" style="width: 100px; height: auto; border-radius: 6px;" />`;
        }
      } catch (err) {
        console.warn("Не удалось получить превью с Vimeo:", err);
      }
    }

    postDiv.innerHTML = `
      ${mediaHTML}
      <div>
        <h4 style="margin: 0 0 0.3em;">${post.title}</h4>
        <p style="margin: 0; font-size: 0.85em; color: #666;">${post.date}</p>
      </div>
    `;

    postLink.appendChild(postDiv);
    latestPostsContainer.appendChild(postLink);
  });
}

async function imageExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (err) {
    console.warn("Ошибка при проверке изображения:", url, err);
    return false;
  }
}

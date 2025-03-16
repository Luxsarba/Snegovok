fetch("posts.json")
    .then(response => response.json())
    .then(data => renderPosts(data))
    .catch(error => console.error("Ошибка загрузки постов:", error));

function renderPosts(posts) {
    const postsList = document.getElementById("posts-list");
    postsList.innerHTML = "";

    posts.forEach(async post => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");

        postElement.style.width = "100%";
        postElement.style.maxWidth = "800px";
        postElement.style.margin = "2em auto";
        postElement.style.padding = "1.5em";
        postElement.style.border = "1px solid #ccc";
        postElement.style.borderRadius = "10px";
        postElement.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
        postElement.style.backgroundColor = "#fff";

        let contentHTML = `
            <h3>${post.title}</h3>
            <p><strong>Дата:</strong> ${post.date}</p>
        `;

        // Преобразуем ссылку на Imgur в прямую ссылку на .jpg
        if (post.image && post.image.includes("imgur.com")) {
            const match = post.image.match(/\/([a-zA-Z0-9]+)$/);
            if (match && match[1]) {
                const imgId = match[1];
                const imgUrl = `https://i.imgur.com/${imgId}.jpg`;
                const imageOk = await imageExists(imgUrl);
                if (imageOk) {
                    contentHTML += `
                        <img src="${imgUrl}" alt="Изображение поста" style="width: 100%; border-radius: 8px; margin-top: 1em;" />
                    `;
                } else {
                    console.warn("Картинка не найдена по ссылке:", imgUrl);
                }
            }
        }

        contentHTML += `<p style="margin-top: 1em;">${post.description}</p>`;
        postElement.innerHTML = contentHTML;

        // Видео Vimeo
        if (post.video) {
            const videoWrapper = document.createElement("div");
            videoWrapper.style = "padding:56.25% 0 0 0;position:relative; margin-top: 1em;";

            const iframe = document.createElement("iframe");
            iframe.src = `${post.video}?badge=0&autopause=0&player_id=0&app_id=58479`;
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media");
            iframe.style = "position:absolute;top:0;left:0;width:100%;height:100%; border-radius: 8px;";
            iframe.title = `video-${post.id}`;

            videoWrapper.appendChild(iframe);
            postElement.appendChild(videoWrapper);
        }

        postsList.appendChild(postElement);
    });
}

// Проверка, существует ли картинка
async function imageExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (err) {
        console.warn("Ошибка при проверке изображения:", url, err);
        return false;
    }
}

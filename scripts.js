document.addEventListener("DOMContentLoaded", () => {
    fetch("posts.json")
        .then(response => response.json())
        .then(posts => {
            const container = document.getElementById("posts-container");
            posts.slice(-3).reverse().forEach(post => {
                const postElement = document.createElement("div");
                postElement.classList.add("post-card");
                postElement.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.date}</p>
                    ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ""}
                    <p>${post.description}</p>
                `;
                container.appendChild(postElement);
            });
        })
        .catch(error => console.error("Ошибка загрузки постов:", error));
});

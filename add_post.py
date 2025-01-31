import json
import os
import shutil
from datetime import datetime


def load_posts(file_path="posts.json"):
    if not os.path.exists(file_path):
        return []
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def save_posts(posts, file_path="posts.json"):
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(posts, file, ensure_ascii=False, indent=4)


def add_post():
    posts = load_posts()

    title = input("Введите заголовок поста: ")
    description = input("Введите описание: ")
    date = datetime.now().strftime("%Y-%m-%d")
    tags = input("Введите теги через запятую: ").split(",")
    tags = [tag.strip() for tag in tags]

    image_path = input("Введите путь к изображению (если есть): ")
    video_path = input("Введите путь к видео (если есть): ")

    new_id = posts[-1]["id"] + 1 if posts else 1

    image_filename = os.path.basename(image_path) if image_path else ""
    video_filename = os.path.basename(video_path) if video_path else ""

    if image_path and os.path.exists(image_path):
        shutil.copy(image_path, os.path.join("images", image_filename))

    if video_path and os.path.exists(video_path):
        shutil.copy(video_path, os.path.join("videos", video_filename))

    new_post = {
        "id": new_id,
        "title": title,
        "date": date,
        "image": f"images/{image_filename}" if image_filename else "",
        "video": f"videos/{video_filename}" if video_filename else "",
        "description": description,
        "tags": tags
    }

    posts.append(new_post)
    save_posts(posts)
    print("Пост успешно добавлен!")


if __name__ == "__main__":
    add_post()

const fetchManga = async (type, genre = "") => {
    let url = `https://api.mangadex.org/manga?limit=10&contentRating[]=safe&contentRating[]=suggestive&originalLanguage[]=${type}&includes[]=cover_art`;
    if (genre) url += `&includedTags[]=${genre}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Gagal mengambil data:", error);
        return [];
    }
};

const getCoverUrl = (manga) => {
    const cover = manga.relationships.find(rel => rel.type === "cover_art");
    return cover ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.512.jpg` : "https://via.placeholder.com/150";
};

const displayMangaList = (mangaList, containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    mangaList.forEach(manga => {
        container.innerHTML += `
            <div class="manga-card">
                <img src="${getCoverUrl(manga)}" alt="Cover">
                <h3>${manga.attributes.title.en || "No Title"}</h3>
                <p>${manga.attributes.description.en?.substring(0, 100) || "No description"}...</p>
                <a href="https://mangadex.org/title/${manga.id}" class="read-btn" data-id="${manga.id}" target="_blank">Baca</a>
            </div>
        `;
    });

    addReadButton();
};

const displayManga = async () => {
    const mangaList = await fetchManga("jp");
    const manhwaList = await fetchManga("kr");

    displayMangaList(mangaList, "manga-list");
    displayMangaList(manhwaList, "manhwa-list");
};

const filterByCategory = async () => {
    const selectedGenre = document.getElementById("category").value;
    document.getElementById("manga-list").innerHTML = "<h2>Manga</h2>";
    document.getElementById("manhwa-list").innerHTML = "<h2>Manhwa</h2>";

    const mangaList = await fetchManga("jp", selectedGenre);
    const manhwaList = await fetchManga("kr", selectedGenre);

    displayMangaList(mangaList, "manga-list");
    displayMangaList(manhwaList, "manhwa-list");
};

const saveHistory = (manga) => {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    
    if (!history.some(item => item.id === manga.id)) {
        history.push({
            id: manga.id,
            title: manga.attributes.title.en || "No Title",
            cover: getCoverUrl(manga)
        });
    }

    localStorage.setItem("history", JSON.stringify(history));
    displayHistory();
};

const displayHistory = () => {
    const historyContainer = document.getElementById("history-list");
    historyContainer.innerHTML = "<h2>History</h2>";

    const history = JSON.parse(localStorage.getItem("history")) || [];
    history.forEach(manga => {
        historyContainer.innerHTML += `
            <div class="manga-card">
                <img src="${manga.cover}" alt="Cover">
                <h3>${manga.title}</h3>
                <a href="https://mangadex.org/title/${manga.id}" target="_blank">Baca Lagi</a>
            </div>
        `;
    });
};

const addReadButton = () => {
    document.querySelectorAll(".read-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            const mangaId = button.getAttribute("data-id");
            fetch(`https://api.mangadex.org/manga/${mangaId}`)
                .then(response => response.json())
                .then(data => saveHistory(data.data));
            window.open(button.href, "_blank");
        });
    });
};

window.onload = () => {
    displayManga();
    displayHistory();
};
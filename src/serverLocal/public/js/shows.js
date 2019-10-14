async function load() {
    const res = await fetch('/shows/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }),
        json = await res.json();

    json.baseURL = 'https://www.themoviedb.org/tv/';

    $('.main-content').html(Handlebars.templates.shows(json));
}

load();
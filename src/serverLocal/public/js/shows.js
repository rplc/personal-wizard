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

    $('.toggleBlacklist').click(async (event) => {
        const show = $(event.target).closest('.show');

        await fetch('/shows/blacklist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: show.data('id')
            })
        });

        load();
    });
}

load();
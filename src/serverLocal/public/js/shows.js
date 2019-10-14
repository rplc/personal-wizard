async function load() {
    const body = getFilters(),
        res = await fetch('/shows/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
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

function getFilters() {
    const filters = {};

    for (const checkbox of $('.filters input:checked')) {
        if (checkbox.name.startsWith('not_')) {
            filters[checkbox.name.substring(4)] = false;
        } else {
            filters[checkbox.name] = true;
        }
    }

    return filters;
}

load();

$('.search').click(() => {
    load();
});
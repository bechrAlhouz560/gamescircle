// global scripts
(function ($) {
    var models = {
        activeComponents: [],
        blogCard: async function (id, title, cover) {
            let blogCont = document.createElement('div');
            blogCont.classList = ['blog-card'];
            let blogCover = document.createElement('div');
            blogCover.classList = ['blog-cover'];
            let blogImg = new Image();
            blogImg.src = cover;
            blogCover.appendChild(blogImg);
            let url = window.location.origin + "/blogs/" + id + "/can_edit_blog";
            let res = await fetch(url, {
                method: "POST",
                headers: {
                    "X-CSRFTOKEN": getCookie("csrftoken"),
                }
            })
            let json = await res.json()
            if (json.can_edit_blog === true) {
                let blogOptions = document.createElement('div');
                blogOptions.classList = ['options'];
                let editOption = document.createElement('div');
                editOption.classList += 'option-btn edit';
                editOption.innerHTML = '<i class="fas fa-edit    "></i>';
                let delOption = document.createElement('div');
                delOption.innerHTML = '<i class="fas fa-trash    "></i>';
                delOption.classList = 'option-btn delete';
                blogOptions.appendChild(editOption);
                blogOptions.appendChild(delOption);
                blogCover.appendChild(blogOptions);
            }

            let blogFooter = document.createElement('div');
            blogFooter.classList = ['blog-footer'];
            blogFooter._id = id;
            let blogTitle = document.createElement('div');
            blogTitle.classList = ['title'];
            blogTitle.innerHTML = ('<p>' + title + '</p>')
            blogFooter.appendChild(blogTitle);


            blogCont.appendChild(blogCover);
            blogCont.appendChild(blogFooter);

            // add functionality for the component
            blogFooter.addEventListener('click', models.eventHandlers.blogCard["blog-footer-click"]);
            return blogCont;

        },
        eventHandlers: {
            blogCard: {
                "blog-footer-click": function (ev) {
                    var id = ev.currentTarget._id;
                    var origin = window.location.origin;
                    var redirect_url = origin + "/blogs/" + id;
                    window.location.href = redirect_url;
                }
            }
        }
    }

    // static components
    let notifiBtn = $('.notifications');
    let navBar = $('.nav-bar');
    let notifyCont = $('.notifys-container');
    let searchBtn = $('.search');
    let searchCont = $('.search-container');

    function getCookie(name) {
        let value = document.cookie
            .split('; ')
            .find(row => row.startsWith(name))
        if (value) {
            value = value.split('=')[1];
        }

        return value;
    }

    function setCookie(name, value) {
        document.cookie = `${name}=${value};path=/`;
    }

    // cookies getter and setters functions

    // navigation bar functionalities:
    let originUrl = document.location.origin;
    let href = document.location.pathname;
    let navLinks = document.getElementsByClassName('nav-link');
    for (let link of navLinks) {
        var curHref = link.pathname;
        console.log(curHref)
        if (curHref === href) {
            link.classList += ' nav-active';
        } else if (curHref === "/accounts/login" || curHref === "/accounts/signup") {
            link.classList += ' nav-active';
        }
    }
    // global components
    let notifitcationComponent = {
        selectors: {
            notifiBtn: () => $('.notifications')

        },
        render: function () {
            // initializing this component by creating its child elements

        }
    }
    let searchComponent = {

        container: () => $('.search-container'),
        setActiveType: (name, el) => {
            let active = searchComponent.container().find('.search-type .type-active');
            active.removeClass('type-active');
            el.addClass('type-active')
            searchComponent.activeType = name;
            setCookie('active_srch_type', name)
        },
        searchTypes: [
            'All',
            "Blogs",
            "Gamers",
            "Videos",

            "Games",

        ],
        // default to 'All'
        activeType: 'All',
        children: {

            "min-search-options": $('<div class="min-search-options"></div>'),
            "min-search-option": $('<div class="min-search-option"></div>'),
            "sort-by": () => {
                let el = $('<span class="sort-by"> Sort by <i class="fa fa-sort ml-1" aria-hidden="true"></i></span>')
                return el;
            },
            "search-loading": $('<div class="search-loading"> <h1><i class="fa fa-search" aria-hidden="true"></i></h1></div>'),
            "search-type": $('<div class="search-type"></div>'),
            "type": function (name, isActive) {
                let el = $('<div class="type"></div>').text(name);

                el.on('click', function (ev) {
                    searchComponent.setActiveType(name, el);
                })
                if (isActive) {
                    el.addClass('type-active');
                }
                return el;
            },

            // special function rendering the children of the search component
            render: function () {
                // rendering the minimized search options
                let minSearchOptionsCont = searchComponent.children["min-search-options"]
                let minSearchOptionCont = searchComponent.children["min-search-option"]
                minSearchOptionCont.append(searchComponent.children["sort-by"]())
                minSearchOptionsCont.append(minSearchOptionCont)
                let searchTypeCont = searchComponent.children["search-type"];

                let type_cookie = getCookie('active_srch_type');
                for (let type of searchComponent.searchTypes) {
                    let active = false;

                    if (!type_cookie) {
                        type_cookie = "All";
                        setCookie("active_srch_type", 'All');
                    }
                    if (type === type_cookie) {
                        active = true;
                    } else {
                        active = false;
                    }
                    console.log(active);
                    let typeDiv = searchComponent.children.type(type, active);
                    searchTypeCont.append(typeDiv);
                }
                minSearchOptionsCont.append(searchTypeCont)
                searchComponent.container().find('.body').before(minSearchOptionsCont)

            }
        },
        selectors: {
            searchBtn: () => $('.search'),
            searchInput: () => $('.search-container .search-input #search-text'),
            searchSubmit: () => $('.search-container .search-input button'),
            searchBody: () => $('.search-container .body')
        },
        // is the search currently loading
        is_loading: false,
        search_text: "",
        request: async (url,queries)=> {
            let _url = new URL(window.location.origin + url);
            let req = {
                        method: "POST",
                        mode: 'cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        headers: {
                            'Content-Type': 'application/json',
                            "X-CSRFTOKEN": getCookie("csrftoken")
                        },
                        body : JSON.stringify(queries[0])
                }
                for (let query of queries)
                {
                    console.log(query)
                     _url.searchParams.append(query.name,query.value);
                }

                let res = await fetch(_url,req);
                return res;
        },
        search_functions: {
            videos: async (value) => {
                // soon
            },
            blogs: async (value) => {
                let response = await searchComponent.request('/search/blogs/',[
                    {
                        name:"blog_query",
                        value:value
                    }
                ]);
                let json = await response.json();
                console.log('blog results = ',json);
                for await (let blog of json.blogs)
                {
                    let cover =window.location.origin + '/blogs/'+blog._id+'/cover'
                    let card = await models.blogCard(blog._id,blog.title,cover);
                    searchComponent.selectors.searchBody().append(card);
                }


            },
            gamers: async (value) => {

                let response = await searchComponent.request('/search/users/',[
                    {
                        name:"user_query",
                        value:value
                    }
                ]);
                let json = await response.json();
                console.log('users results = ',json);
            },
            games: async (value) => {
                // soon
            },
            all: async (value) => {
                // soon
            },
        },
        toggleLoading: (container) => {
            var el = document.querySelector('.search-loading');
            if (el) {
                el.remove();
            } else {
                container.html(searchComponent.children["search-loading"]);
            }
        },
        render: function () {
            // initializing this component by creating its child elements
            searchComponent.children.render();
            // initializing search inputs
            searchComponent.selectors.
            searchInput().on('input', (ev) => {
                let value = $(ev.currentTarget).val();
                if (value !== "") {
                    searchComponent.search_text = value;
                }

            });
            searchComponent.selectors.
            searchSubmit().on('click', async (ev) => {
                if (!searchComponent.is_loading) {
                    searchComponent.is_loading = true;
                    console.log('your search is ', searchComponent.search_text);
                    searchComponent.toggleLoading(searchComponent.selectors.searchBody())
                    await searchComponent.search_functions[searchComponent.activeType.toLowerCase()](searchComponent.search_text);
                    console.log('results is now available !')
                    searchComponent.toggleLoading(searchComponent.selectors.searchBody())
                    searchComponent.is_loading = false;
                }
            })

        },

    }
    // notification button functionality
    notifiBtn.on('click', function () {
        if (searchBtn.hasClass("nav-active")) {
            searchBtn.removeClass('nav-active')
            notifiBtn.addClass('nav-active')
            searchCont.css({
                display: "none"
            })
            notifyCont.css({
                display: "block"
            })
        } else {
            let notifyDisplay = "none";
            let navBarWidth = "70px";
            if (navBar.css('width') === "370px") {
                navBarWidth = "70px";
            } else {
                navBarWidth = "370px";
                notifyDisplay = "block"
            }
            navBar.animate({
                width: navBarWidth
            }, 200, function () {
                notifyCont.css('display', notifyDisplay);
                var hasClass = notifiBtn.hasClass('nav-active');
                if (hasClass) {
                    notifiBtn.removeClass('nav-active');
                } else {
                    notifiBtn.addClass('nav-active');
                }
            });
        }
    });
    // search functionality
    searchBtn.on('click', function () {
        let searchInput = $('.search-input input')

        if (notifiBtn.hasClass("nav-active")) {
            notifiBtn.removeClass('nav-active')
            searchBtn.addClass('nav-active')
            notifyCont.css({
                display: "none"
            })
            searchCont.css({
                display: "block"
            })
        } else {
            let notifyDisplay = "none";
            let navBarWidth = "70px";
            if (navBar.css('width') === "370px") {
                navBarWidth = "70px";
            } else {
                navBarWidth = "370px";
                notifyDisplay = "block"
            }
            navBar.animate({
                width: navBarWidth
            }, 200, function () {
                searchCont.css('display', notifyDisplay);
                var hasClass = searchBtn.hasClass('nav-active');
                if (hasClass) {
                    searchBtn.removeClass('nav-active');
                } else {
                    searchBtn.addClass('nav-active');
                }
            });
        }
    });
    // Global Models
    document.models = {
        success_msg: function (msg) {
            let content = $(`<div class="success-msg-container">
                    <div class="success-msg">
                        <div class="content">
                        <h2><i class="fa fa-check-circle mr-3 color-success" aria-hidden="true"></i></h2>

                            <h2>
                                ${msg}</h2>
                        </div>
                        <div class="btns-group">
                            <div class="ok-btn">OK</div>
                        </div>
                    </div>
                </div>`);
            let ok_btn = content.find('.btns-group .ok-btn');
            ok_btn.on('click', function (ev) {
                content.fadeToggle(300)
            })
            return content;
        },
        append_success_msg: function (msg) {
            $('.loading-bar').before(document.models.success_msg(msg))
            return document.models.success_msg(msg);

        },
        error_msg: function (msg) {
            let content = $(`<div class="success-msg-container">
                    <div class="success-msg">
                        <div class="content">
                        <h2><i class="fa fa-check-circle mr-3" aria-hidden="true"></i></h2>

                            <h2>
                                ${msg}</h2>
                        </div>
                        <div class="btns-group">
                            <div class="ok-btn">OK</div>
                        </div>
                    </div>
                </div>`);
            let ok_btn = content.find('.btns-group .ok-btn');
            ok_btn.on('click', function (ev) {
                content.fadeToggle(300)
            })
            return content;
        },
        append_error_msg: function (msg) {
            $('.loading-bar').before(document.models.success_msg(msg))
            return document.models.success_msg(msg);

        },
        components : models
    }

    function globalInit() {

        searchComponent.render();
    }
    globalInit();

})($);

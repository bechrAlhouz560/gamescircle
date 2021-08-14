(async function ($) {
    console.log(document.models)
    let controller = new AbortController();
    let signal = controller.signal;
    let cookie = document.cookie;
    let loadingBar = $('.loading-bar');

    // this function can be used in development ONLY !
    const delay = time => new Promise(resolve => setTimeout(resolve, time));
    // cookies getter and setters functions
    function getCookie(name) {
        let value = document.cookie
            .split('; ')
            .find(row => row.startsWith(name))
            .split('=')[1];
        return value;
    }
    document.getCookie = getCookie;

    /** make general client requests to the server
     * @param {RequestInit} requestInit
     * @param {Event[]} events
     */
    function clientRequester(requestInit, events) {
        let client = new XMLHttpRequest();
        client.open(requestInit.method, requestInit.url);
        let headers = [{
            name: "X-CSRFTOKEN",
            value: getCookie('csrftoken')
        }]
        if (requestInit.header) {
            for (let header of requestInit.headers) {
                headers.push({
                    name: header.name,
                    value: header.value
                })
            }
        }
        for (let event of events) {
            client.addEventListener(event.name, event.func);
        }
        for (let header of headers) {
            client.setRequestHeader(header.name, header.value);
        }
        try {
            client.send(requestInit.body);
        } catch (error) {
            console.log(error)
        }
        return client;
    }
    document.clientRequester = clientRequester;

    // global models
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
                delOption.blog_id = id;
                delOption.addEventListener('click',models.eventHandlers.blogCard.delete_blog);
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
        empty_msg: function (message) {
            return $(`<div class="no-blogs-msg">
                        <h3><i class="fa fa-ellipsis-h" aria-hidden="true"></i></h3>
                        <h3>${message}</h3>
                    </div>`);
        },
        eventHandlers: {
            blogCard: {
                "blog-footer-click": function (ev) {
                    var id = ev.currentTarget._id;
                    var origin = window.location.origin;
                    var redirect_url = origin + "/blogs/" + id;
                    window.location.href = redirect_url;
                },
                delete_blog: async function (ev) {
                    var blog_id = ev.currentTarget.blog_id;
                    let req = {
                        method: "POST",
                        mode: 'cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        headers: {
                            'Content-Type': 'application/json',
                            "X-CSRFTOKEN": getCookie("csrftoken")
                        },

                    }

                    let url = window.location.origin + "/blogs/" + blog_id + "/delete";
                    let response = await fetch(url, req);
                    if (response.ok)
                    {
                        document.models.append_success_msg('Your Blog deleted successfuly !');
                        if (tabBar.activeLink === "blogs")
                        {
                            $('._second_profile_body').html("");
                            await tabBar.init_blogs();

                        }
                        else if (tabBar.activeLink == undefined) {
                            $('.latest-blog').html("");
                            await tabBar.init();
                        }

                    }
                }
            }
        }
    }
    document.blog_models = models;
    var tabBar = {
        activeLink: undefined,
        selector: $('.profile-nav-link:not(.fallow-btn)'),
        links: {
            "blogs": document.location.origin + "/me/blogs",
            "games": document.location.origin + "/me/games",
            "videos": document.location.origin + "/me/videos",
            "groups": document.location.origin + "/me/groups",
        },
        init: async function () {
            tabBar.selector.on('click', async function (ev) {
                let $this = ev.currentTarget;
                let clickedLinkUrl = tabBar.links[$this.classList[1]];
                console.log(clickedLinkUrl);
                let loaded = await tabBar.load(clickedLinkUrl);
                if (loaded) {
                    if (tabBar.activeLink) {
                        $(tabBar.activeLink).removeClass('profile-nav-active');
                    }
                    $this.classList += " profile-nav-active";
                    tabBar.activeLink = $this;
                }
            });
            let latestBlog = $('.latest-blog');

            let res = await tabBar.requests.get_user_blogs($('.username').text(), false, 3)

            let json = await res.json();
            console.log(json)

            if (json.blogs) {
                for await (let blog of json.blogs) {

                    let cover_url = window.location.origin + "/blogs/" + blog.blog_id + "/cover";
                    var blogCont = await models.blogCard(blog.blog_id, blog.title, cover_url);
                    latestBlog.append(blogCont);
                }
            } else {
                latestBlog.html(models.empty_msg('This Gamer has no Blogs to show.'));
            }
        },
        load: async function (url) {
            try {
                var request = new Request({}, {
                    method: "POST",
                    signal: signal,
                    headers: {
                        "X-CSRFTOKEN": getCookie('csrftoken')
                    }
                })
                let response = await fetch(url, request);
                if (response.ok) {
                    $('._second_profile_body').html(await response.text())
                        .ready(async function (ev) {

                            let _function = 'init_' + tabBar.activeLink.classList[1];
                            await tabBar[_function]();
                        });
                } else {
                    console.log(response.status)
                }
                return true;
            } catch (err) {
                console.log(err)
                return false;
            }

        },
        init_blogs: async function () {
            console.log('blogs loading !')
            let res = await tabBar.requests.get_user_blogs($('.username').text(), true, 0)

            let json = await res.json();
            console.log(json)
            if (json.blogs.length !== 0) {
                for await (let blog_list of json['blogs']) {

                    var cont = $(`<div class="blog-group">
                <div class="title">
                    <h1>${blog_list.date}</h1>
                </div>
                <div class="body  card-group w-100">

                </div>
                </div>`).css('width', '100%')

                    for await (let blog of blog_list.blogs) {
                        console.log(blog)
                        let contains = document.contains(cont[0]);
                        let cover = window.location.origin + "/blogs/" + blog.blog_id + "/cover";
                        let model = await models.blogCard(blog.blog_id, blog.title, cover);
                        if (!contains) {
                            $('._second_profile_body').append(cont);
                            cont.find('.body').append(model);
                        } else {
                            cont.find('.body').append(model);
                        }
                    }
                }
            } else {

            }
        },
        init_games: async function () {

        },
        init_groups: async function () {

        },
        init_videos: async function () {

        },
        requests: {
            get_user_blogs: async function (username, order_by_date, limit) {
                let req = {
                    method: "POST",
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    headers: {
                        'Content-Type': 'application/json',
                        "X-CSRFTOKEN": getCookie("csrftoken")
                    },
                    body: JSON.stringify({
                        order_by_date: order_by_date,
                        username: username,
                        limit: limit || 0
                    })
                }
                let url = window.location.origin + "/blogs/get_user_blogs/"
                return await fetch(url, req);
            },
            delete_blog: async function (blog_id) {
                let req = {
                    method: "POST",
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    headers: {
                        'Content-Type': 'application/json',
                        "X-CSRFTOKEN": getCookie("csrftoken")
                    },
                    body: JSON.stringify({})
                }
                let url = window.location.origin + "/blogs/" + blog_id + "/delete"
                return await fetch(url, req);
            }
        }

    }
    window.tabBar = tabBar;


    // start initializing the tab bars
    await tabBar.init();

})($).then(function () {
    console.log('script ran successfully !')
})

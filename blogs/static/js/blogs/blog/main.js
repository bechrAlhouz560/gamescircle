(function () {
    function getCookie(name) {
        let value = document.cookie
            .split('; ')
            .find(row => row.startsWith(name))
            .split('=')[1];
        return value;
    }

    function range(start, end) {
        let list = []
        for (let i = start; i <= end; i++) {
            list.push(i);
        }
        return list;
    }
    let cover = document
        .getElementsByClassName('blog-img')[0];
    let cover_img = cover.firstElementChild

    cover.onmousemove = function (ev) {
        let cover_center_coords = [cover_img.clientHeight / 2, cover_img.clientWidth / 2]

        let x = (cover_center_coords[1] - ev.x)
        let y = (cover_center_coords[0] - ev.y)

        if (cover_img.clientWidth > ev.x && cover_img.clientWidth > ev.y) {
            cover_img.style.transform = `translate(${x}px,${y}px)`;

        }

    }
    cover.onmouseout = function (ev) {
        cover_img.style.transform = "";
    }
    let blog = {

        id: document.querySelector('.blog-container').id,
        comment_inputs_active: false,
        models: {
            comment_loading: async function (count) {
                var mainEl = document.createElement('div')
                mainEl.classList = "comment-loading-container";
                for await (let i of range(0, count)) {
                    let el = $(`<div class="comment-loading">
                            <div class="user-img-loading">

                            </div>
                            <div class="content-loading">

                            </div>
                        </div>`);
                    mainEl.appendChild(el[0]);
                }
                return mainEl;
            },
            no_comments: $(`<div class="comments-empty">
                            <p><i class="fa fa-ellipsis-h" aria-hidden="true"></i></p>
                            <span class="message">You can be the first how comments !</span>
                        </div>`),

            comment: function (args) {
                function checkIfComment() {
                    if (args.isComment) {
                        return `<div class="option reply"><span>Reply</span></div>
                                    <div class="option reply show-replies"><span>Show ${args.replies_count} replies</span></div>`;
                    } else {
                        return '';
                    }
                }

                let comment_content = blog.eventHandlers.resolveTags(args.content);
                var content = $(`<div class="comment">
                            <div class="user_img">
                                <img src="${args.user_img || ""}" alt="">
                            </div>
                            <div class="comment_content">
                                <div class="content">
                                    <h5 class="username">${args.commented_by}</h5>
                                        <span>${comment_content}</span>
                                </div>

                                <div class="options">
                                    <div class="option date"><span>${args.created_date}</span></div>
                                    ${checkIfComment()}
                                </div>
                            </div>
                        </div>`);
                content[0]._id = args.id;
                console.log(args.id)
                let username = content.find('.comment_content .username');
                username.on('click', function (ev) {
                    window.location.href = window.location.origin + "/user/" + args.commented_by;
                });
                if (checkIfComment() !== '') {
                    let show_reply_btn = content.find('.comment_content  .options .show-replies');
                    show_reply_btn[0].addEventListener('click', function (ev) {
                        ev.comment_id = args.id;
                        ev.container = content;
                        if (content.repliesShown) {
                            content.find(' > .comment_content .comment').remove();
                            content.repliesShown = false;
                            show_reply_btn[0].innerText = "Show " + args.replies_count + " replies"
                        } else {
                            blog.eventHandlers.show_replies(ev);
                        }

                    });
                    let reply_btn = content.find('.comment_content  .options .reply')[0];
                    reply_btn.addEventListener('click', function (ev) {
                        let model = blog.models.comment_inputs({
                            comment_id: args.id,
                            container: content
                        });

                        let com_content = content.find('.comment_content')

                        if (!blog.comment_inputs_active) {

                            blog.comment_inputs_active = model;
                        } else {
                            blog.comment_inputs_active.remove();
                            blog.comment_inputs_active = model;
                        }
                        com_content.after(model);
                    })
                }
                blog.comments_list.push(args.pk);
                return content;
            },
            more_comments: function () {
                let el = $(` <div class="more-comments">
                            <div class="more-comments-btn">
                                <i class="fa fa-plus" aria-hidden="true"></i>
                            </div>
                        </div> `);
                let btn = el.find(".more-comments-btn");
                btn.on('click', blog.eventHandlers.more_comments);
                return el;
            },
            comment_inputs: function (args) {
                let content = $(`<div class="comment-inputs">
                            <textarea id="comment-reply" placeholder="Your comment here..."></textarea>
                            <button class="cg-btn" id="comment-reply-btn"><i class="fas fa-paper-plane    "></i></button>
                        </div>`);
                let comment_text = content.find('#comment-reply');
                let comment_btn = content.find('#comment-reply-btn');
                comment_btn[0].content = comment_text.val();
                comment_btn.on('click', function (ev) {
                    ev._id = args.comment_id;
                    ev.content = comment_text.val();
                    ev.container = args.container;
                    blog.eventHandlers.reply(ev);
                })
                return content;
            },
            comments_count: $('.comments-container .list-comments .title h4 span ')
        },
        elements: {
            comments_body: () => $('.comments-container .list-comments .body'),
            comment_input: () => $("#comment-text"),
            comment_btn: () => $('#comment-btn'),
            check: $('<i class="fa fa-check" aria-hidden="true"></i>'),
            stars: () => $('.blog-rates > .stars .star'),
            average_stars: () => $('.blog-rates > average-rate .stars .star'),
            similar_blogs: () => $('.similar-blogs .body')
        },
        request: {
            requestInit: {
                method: "POST",
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRFTOKEN": getCookie("csrftoken")
                },
            },
            similar_blogs:async function () {
                let req = blog.request.requestInit;
                let url = window.location.origin + "/blogs/" + blog.id + "/similar";
                return await fetch(url, req);
            },
            comment: async function (content, tags) {
                let req = {
                    method: "POST",
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    headers: {
                        'Content-Type': 'application/json',
                        "X-CSRFTOKEN": getCookie("csrftoken")
                    },
                    body: JSON.stringify({
                        content: content,
                        tagged: tags
                    })
                }

                let url = window.location.origin + "/blogs/" + blog.id + "/comments/create";
                return await fetch(url, req);
            },
            reply: async function (content, comment_id) {
                let req = {
                    method: "POST",
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    headers: {
                        'Content-Type': 'application/json',
                        "X-CSRFTOKEN": getCookie("csrftoken"),

                    },
                    "body": JSON.stringify({
                        reply_content: content
                    })
                }

                let url = window.location.origin + "/blogs/" + blog.id + "/comments/" + comment_id + "/reply";
                return await fetch(url, req);
            },
            rate: async function (stars_count) {
                let url = window.location.origin + "/blogs/" + blog.id + "/rate";
                let req = blog.request.requestInit;
                req.body = JSON.stringify({
                    stars_count: stars_count
                })
                return await fetch(url, req);
            },
            get_rates: async function () {
                let url = window.location.origin + "/blogs/" + blog.id + "/rates";
                let req = blog.request.requestInit;
                return await fetch(url, req);
            },
            get_user_rate: async function () {
                let url = window.location.origin + "/blogs/" + blog.id + "/user_rate";
                let req = blog.request.requestInit;
                return await fetch(url, req);
            },
            get_blog : async function () {
              let url = window.location.origin + "/blogs/" + blog.id +"/";
              let req = blog.request.requestInit;
              return await fetch(url, req);
            },
            save: async function (blog_id) {

            },
            get_comments: async function (blog_id, count, start_with) {
                let req = {
                    method: "POST",
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    headers: {
                        'Content-Type': 'application/json',
                        "X-CSRFTOKEN": getCookie("csrftoken")
                    },
                    body: JSON.stringify({
                        count: count || 1,
                        start_with: start_with || 1
                    })
                }

                let url = window.location.origin + "/blogs/" + blog_id + "/comments";
                return await fetch(url, req);
            },

            get_replies: async function (comment_id, count) {
                let req = {
                    method: "POST",
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    headers: {
                        'Content-Type': 'application/json',
                        "X-CSRFTOKEN": getCookie("csrftoken")
                    },
                }

                let url = window.location.origin + "/blogs/" + blog.id + "/comments/" + comment_id + "/replies";
                return await fetch(url, req);
            },
            get_comment: async function (comment_id) {
                let req = {
                    method: "POST",
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    headers: {
                        'Content-Type': 'application/json',
                        "X-CSRFTOKEN": getCookie("csrftoken")
                    },
                }

                let url = window.location.origin + "/blogs/" + blog.id + "/comments/" + comment_id;
                return await fetch(url, req);
            },
            average_rate: async function () {
                let url = window.location.origin + "/blogs/" + blog.id + "/rates/average";
                let req = blog.request.requestInit;
                return await fetch(url, req);
            },
            is_authenticated: async function () {
                let url = window.location.origin + "/is_authenticated/";
                let req = blog.request.requestInit;
                return await fetch(url, req);
            },
            blog_views: async function () {
                let url = window.location.origin + "/blogs/" + blog.id + "/views";
                let req = blog.request.requestInit;
                return await fetch(url, req);
            }

        },
        eventHandlers: {
            getTag: function (text) {
                let splitted = text.split(' ');
                let taggedUsersIds = [];
                for (let word of splitted) {
                    let result = word.search("@")
                    if (result === 0) {

                        taggedUsersIds.push(word.split('@')[1]);
                    }
                }
                return taggedUsersIds;
            },
            resolveTags: function (content) {
                let comment_content = content;
                let tags = blog.eventHandlers.getTag(content);
                comment_content = comment_content.replace('@', "")
                for (let tag of tags) {
                    let user_url = window.origin + "/user/" + tag;
                    comment_content = comment_content.replace(tag, `<a href="${user_url}" class="tagged">${tag}</a>`);
                }
                return comment_content;
            },
            comment: async function (event) {
                var is_user_authenticated = await blog.request.is_authenticated()
                var is_authenticated = await is_user_authenticated.json();
                if (is_authenticated.message === "success") {
                    let el = $(event.currentTarget);
                    el.attr("disabled", true);
                    let content = blog.elements.comment_input().val();
                    let tags = blog.eventHandlers.getTag(content);
                    console.log('tags = ', tags);
                    let res = await blog.request.comment(content, tags);
                    let jsonResponse = await res.json();
                    el.removeAttr("disabled");
                    blog.elements.comment_input().val('')
                    el.html(blog.elements.check);
                    setTimeout(() => {
                        el.html('<i class="fa fa-paper-plane" aria-hidden="true"></i>');
                    }, 1000);
                    let comment_res = await blog.request.get_comment(jsonResponse.id);
                    let comment_json = await comment_res.json();
                    comment_json.isComment = true;
                    blog.elements.comments_body().find('.more-comments').before(blog.models.comment(comment_json));
                    let comment_counts = Number(blog.models.comments_count.text());
                    blog.models.comments_count.text(comment_counts + 1);
                }
            },
            show_comments: async function (start_with) {
                // start inializing comments
                let count = 10;
                let comment_body = blog.elements.comments_body();
                // show that the comments are loading...
                let loadings = await blog.models.comment_loading(count);
                comment_body.find(".more-comments").before(loadings);
                let res = await blog.request.get_comments(blog.id, count, start_with || []);
                let comments_list = await res.json();
                if (comments_list['comments'] != 0) {
                    for await (let comment of comments_list['comments']) {
                        comment.isComment = true;
                        let model = blog.models.comment(comment);
                        comment_body.find(".more-comments").before(model);
                        loadings.remove();

                    }


                } else {
                    blog.elements.comments_body().html(blog.models.no_comments);
                }

                $('.comments-container .list-comments .title h4 span ')[0].innerHTML = comments_list['count'];
                // `<h4><i class="fas fa-comments mr-3 "></i> Comments <span class="comments_count ml-2">${}</span></h4>`;
            },
            more_comments: async function (event) {
                let target = $(event);
                let count = 6;
                let comment_body = blog.elements.comments_body();
                // show that the comments are loading...
                let loadings = await blog.models.comment_loading(count);
                comment_body.find(".more-comments").before(loadings);
                let res = await blog.request.get_comments(blog.id, count, blog.comments_list);
                let comments_list = await res.json();
                console.log(comments_list['comments'])
                if (comments_list['comments'].length != 0) {
                    for await (let comment of comments_list['comments']) {
                        comment.isComment = true;
                        let model = blog.models.comment(comment);
                        comment_body.find(".more-comments").before(model);
                        loadings.remove();

                    }
                    console.log(blog.comments_list)

                } else {
                    $('.more-comments').remove()
                    loadings.remove();
                }


            },
            show_replies: async function (event) {
                let el = $(event.currentTarget);
                let response = await blog.request.get_replies(event.comment_id, 5);
                let json = await response.json();
                let show_reply_btn = event.container.find('.comment_content > .options > .show-replies')


                for await (let reply of json['comment_replies']) {
                    let model = blog.models.comment({
                        id: reply.reply_id,
                        commented_by: reply.replied_by,
                        content: reply.content,
                        created_date: reply.created_date
                    });
                    event.container.find(' > .comment_content').append(model);
                }
                show_reply_btn.text('Hide replies');
                event.container.repliesShown = true;
            },
            reply: async function (event) {
                let el = $(event.currentTarget);
                let response = await blog.request.reply(event.content, event._id);
                let json = await response.json();
                console.log(json)
                let model = blog.models.comment({
                    id: json.reply_id,
                    commented_by: json.replied_by,
                    content: json.content,
                    created_date: json.created_date,
                    isComment: false,
                    replies_count: json.replies_count

                });
                let reply_btn = event.container.find(' .comment_content > .options > .show-replies');
                reply_btn.text('Show ' + json.replies_count + ' replies')

                event.container.find('.comment-inputs').remove();
                let comment_counts = Number(blog.models.comments_count.text());
                blog.models.comments_count.text(comment_counts + 1);

            },
            setStarsCount: function (ev) {
                blog.elements.stars().removeClass('star-active')
                let target = $(ev.currentTarget)[0];
                console.log(target)
                let number = target.classList[1];

                for (let i = number - 1; i >= 0; i--) {
                    let el = blog.elements.stars()[i]
                    el.classList += " star-active";
                }
            },
            _setStarsCount: function (count) {
                console.log('count = ', count)
                if (count !== 0) {
                    let target = $('.stars').find('.star.' + count)[0];
                    let number = target.classList[1];

                    for (let i = number - 1; i >= 0; i--) {
                        let el = blog.elements.stars()[i]
                        el.classList += " star-active";
                    }
                }
            },
            setRatesCount: async function () {
                var res = await blog.request.get_rates();
                var jsonRes = await res.json();
                console.log(jsonRes)
                let selector = $(".blog-rates .count span");
                selector.text(jsonRes.count);
            },
            setAverageRate: async function () {
                let res_ = await blog.request.average_rate();
                let json_res = await res_.json();
                let count = Number(json_res.stars.toString().split('.')[0]);
                console.log('average count = ', count)
                if (count !== 0) {
                    let target = $('.average-rate .stars').find('.star.' + count)[0];
                    console.log('Average target =', target)
                    let number = target.classList[1];

                    for (let i = number - 1; i >= 0; i--) {
                        let el = $('.average-rate .stars')[0].children[i];
                        el.classList += " star-active";
                    }
                }

            },
            similar_blogs:async function () {
                let res_ = await blog.request.similar_blogs();
                let json_res = await res_.json();
                console.log(json_res)
                if (json_res.similar_blog.length !== 0)
                {
                     for await (let _blog of json_res.similar_blog)
                     {
                        let model = await document.models.components.blogCard(_blog.blog_id,_blog.title,_blog.blog_image);
                        blog.elements.similar_blogs().append(model)
                     }
                }
            },
            set_viewed: async function () {
                let url = window.location.origin + "/blogs/" + blog.id + "/set_viewed";
                let req = blog.request.requestInit;
                let res =  await fetch(url, req);
                if (res.ok)
                {
                    let json = await res.json();

                    console.log(json);

                }
            }
        },
        comments_list: [

        ],
        init: async function () {
            // start inializing rates
            var user_rates = await blog.request.get_user_rate();
            var user_rates_json = await user_rates.json();
            await blog.eventHandlers.setRatesCount();

            blog.eventHandlers._setStarsCount(user_rates_json.stars || 0);
            blog.elements.stars().on('mouseenter', blog.eventHandlers.setStarsCount);
            blog.elements.stars().on('mouseleave', async function (ev) {
                blog.elements.stars().removeClass('star-active');
                var user_rates = await blog.request.get_user_rate();
                var user_rates_json = await user_rates.json();
                blog.eventHandlers._setStarsCount(user_rates_json.stars || 0);
            });
            blog.elements.stars().on('click', async function (ev) {
                blog.elements.stars().removeClass('star-active');
                let target = $(ev.currentTarget)[0];
                let number = target.classList[1];

                var rate_res = await blog.request.rate(number);
                var rate_res_json = await rate_res.json();

                blog.eventHandlers._setStarsCount(rate_res_json.stars_count);
                // await blog.eventHandlers.setRatesCount();
            });
            let el = blog.models.more_comments();
            el.on('click', blog.eventHandlers.show_comments);
            blog.elements.comments_body().append(blog.models.more_comments());
            await blog.eventHandlers.setAverageRate();
            await blog.eventHandlers.show_comments();
            blog.elements.comment_btn().on('click', blog.eventHandlers.comment);
            setTimeout (async function () {
                await blog.eventHandlers.set_viewed();
                console.log('Blog Viewed !')
            },1)
            await blog.eventHandlers.similar_blogs
            // get the content of the blog;
            let req = await blog.request.get_blog();
            let blog_content = await req.json();
            $('.blog-content').append(blog_content.blog_content);


        },
        refresh: async function () {
            blog.elements.comments_body().html('');
            await blog.init();

        }
    }
    blog.init();

})();

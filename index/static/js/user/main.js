await (async function ($) {
    function getCookie(name) {
        let value = document.cookie
            .split('; ')
            .find(row => row.startsWith(name))
            .split('=')[1];
        return value;
    }
    let elements = {
        fallowBtn: () => $('.fallow-btn')
    }
    let requests = {
        get_username :  async function () {
            
        },
        fallow: async function () {
            try {
                let username = $('.username');
                let url = window.location.origin + "/user/"+username.text()+"/fallow";
                let req = {
                    method: "POST",
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    headers: {
                        'Content-Type': 'application/json',
                        "X-CSRFTOKEN": getCookie("csrftoken")
                    },
                }
                let res = await fetch(url,req)
                if (res.ok)
                {
                    let json = await res.json();
                    return json;
                }
                else
                {
                    throw new Error("Oops ! There are an Error. Try again Later.")
                }
            } catch (error) {
                return {error}
            }
        },
        unfallow: async function () {

        },
        is_fallowing : async function () {
            let username = $('.username');
                let url = window.location.origin + "/user/"+username.text()+"/is_fallowing";
                let req = {
                    method: "POST",
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    headers: {
                        'Content-Type': 'application/json',
                        "X-CSRFTOKEN": getCookie("csrftoken")
                    },
                }
                let res = await fetch(url,req)
                if (res.ok)
                {
                    let json = await res.json();
                    return json;
                }
                else
                {
                    throw new Error("Oops ! There are an Error. Try again Later.")
                }
        }
    }
    
})($)
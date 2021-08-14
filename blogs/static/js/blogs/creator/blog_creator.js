function getCookie(name) {
    let value = document.cookie
        .split('; ')
        .find(row => row.startsWith(name))
        .split('=')[1];
    return value;
}
/** make general client requests to the server
 * @param {RequestInit} requestInit
 * @param {object} events
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
(function () {
    var LoadingBar = {
        element: $('.loading-bar'),
        set: function (number, max) {
            let percent;
            if (number !== max) {
                percent = ((number * max) / 100) + "%";
            } else {
                percent = "0%";
            }
            LoadingBar.element.width(percent);
        }
    }

    function range(from, to) {
        var list = []
        for (let i = from; i <= to; i++) {
            list.push(i)

        }
        return list;
    }
    var Editor = {
      selectors : {
         container : () => $('.blog-editable'),
         toolsContainer : () => $('.editor-tools')
      },
      format: function (command, value) {
        console.log(document.execCommand(command, false, value));
      },
      models : {
        groupTools : (group,) => {
           let mainContainer = document.createElement('div');
           mainContainer.classList = ['group-tools',];
           for (let tool of group.tools)
           {
             let toolCont = document.createElement('button');
             toolCont.classList = ['tool',];
             toolCont.setAttribute('tab-index','0');
             toolCont.setAttribute('data-tooltip',tool.name);
             toolCont.innerHTML = `<span class="icon">${tool.icon}</span>`;
             toolCont.onclick = tool.click
             mainContainer.appendChild(toolCont);
           }
           return mainContainer;
        }
      },
      editorTools : [
         // group tools
         {
            name : 'alignment',
            tools : [
                 {
                    name:'left align',
                    icon: '<i class="fas fa-align-left "></i>',
                    click : ()=> {
                        Editor.format('justifyleft');
                    }

                 },
                 {
                    name:'center align',
                    icon: '<i class="fas fa-align-center "></i>',
                    click : ()=> {
                        Editor.format('justifycenter');
                    }

                 },
                 {
                    name:'right align',
                    icon: '<i class="fas fa-align-right "></i>',
                    click : ()=> {
                        Editor.format('justifyright');
                    }

                 },
                 {
                    name:'increase indent',
                    icon: '<i class="fas fa-indent "></i>',
                    click : ()=> {
                        Editor.format('indent');
                    }

                 },
                 {
                    name:'decrease indent',
                    icon: '<i class="fas fa-outdent "></i>',

                 }
            ]
        },
         // group tools
         {
           name : 'text sizing',
           tools : [

             {
                name:'Font Style',
                icon: '<i class="fas fa-font "></i>',
                click : () => {
                   // command name 'fontName'
                   if (dropdown === []) {

                   }
                },


             },
             {
                name:'Heading',
                icon: '<i class="fas fa-heading "></i>',
                click : () => {
                   // command name 'fontName'
                }
             },
             {
                name:'Font size',
                icon: '<i class="fas fa-text-height "></i>',

             }
           ]
       },
         // group tools
         {
          name : 'text styling',
          tools : [
            {
               name:'Text Bold',
               icon: '<i class="fas fa-bold "></i>',
               click : ()=> {
                   Editor.format('bold')
               }

            },
            {
               name:'Text underline',
               icon: '<i class="fas fa-underline "></i>',
               click : ()=> {
                   Editor.format('underline');
               }

            },

            {
               name:'Text Italic',
               icon: '<i class="fas fa-italic "></i>',
               click : ()=> {
                   Editor.format('italic');
               }

            },
            {
               name:'background color',
               icon: '<i class="fas fa-pen "></i>',
               click : (ev) => {
                  // command name 'backColor'
                  let tool = ev.currentTarget;
                  console.log(tool);
               }
            }
          ]
      },
         // group tools
         {
          name:'text listing',
          tools : [

            {
               name:'Dotted list',
               icon: '<i class="fas fa-list-ol "></i>',
               click : () => {
                  Editor.format('insertorderedlist');

               }

            },
            {
               name:'numbered list',
               icon: '<i class="fas fa-list "></i> ',
               click : () => {
                 Editor.format('insertunorderedlist');

               }
            }
          ]
       },
         // group tools
         {
          name:"",
          tools : [

            {
               name:'Undo',
               icon: '<i class="fas fa-undo "></i>',

            },
            {
               name:'Redo',
               icon: '<i class="fas fa-redo "></i>',

            }
          ]
       }
     ],
      init : async function () {
        let toolsContainer = Editor.selectors.toolsContainer();
        let blogEditor = Editor.selectors.container();
        for (let group of Editor.editorTools)
        {
           let groupTools = Editor.models.groupTools(group);
           toolsContainer.append(groupTools)
        }


      }
    }
    var blogView = {
        inputs: {
            imageFile: null,
            title: null,
            content: null
            // ...
        },
        base64: async function (file) {
            var data = await file.arrayBuffer();
            let base64String = "";
            for (let i = 0; i < data.length; i++) {
                base64String += String.fromCharCode(data[i]);
            }
            let base64 = "data:" + file.type + ";base64," +
                window.btoa(base64String);
            return base64;
        },
        elements: {
            cover: () => $('#image-cover'),
            uploadBtn: () => $('.new-blog-cover .upload-cover-btn'),
            title: () => $('.new-blog-title .title-input'),
            content: () => $('#blog-content'),
            submitBtns: {
                save: () => $('.submit-btns .post'),
                cancel: () => $('.submit-btns .cancel')
            },
            coverContainer: () => $('.new-blog-cover .cover')
        },
        init: function () {
            console.log('the Blog View is being initialized...');
            blogView.elements.uploadBtn().on('click', function (ev) {
                ev.preventDefault();
                blogView.elements.cover().click();
            });
            blogView.elements.cover().on('input', blogView.eventHandlers.coverUpload);
            blogView.elements.submitBtns.save().on('click', blogView.eventHandlers.postBlog);
        },
        eventHandlers: {
            /**
             *
             * @param {Event} event
             */
            coverUpload: async function (event) {
                let allowedImages = ['jpeg', 'jpg', 'png'];
                let coverEl = event.currentTarget;
                let imageFile = coverEl.files[0];
                imageFile.fileName = "bechr";

                console.log('file name: ', imageFile)
                let reader = new FileReader();
                let img = new Image();
                img.style.width = "100%";
                reader.onprogress = function (ev) {
                    let loaded = ev.loaded;
                    let total = ev.total;
                    LoadingBar.set(loaded, total);

                }
                reader.onloadend = function (ev) {
                    var url = ev.target.result;
                    img.src = url;
                    blogView.inputs.imageFile = imageFile;
                }


                reader.readAsDataURL(imageFile)
                blogView.elements.coverContainer().html(img);

            },
            postBlog: function (event) {
                blogView.post();
            }
        },
        checkCoverImage: function (image) {
            let width = image.width;
            let height = image.height;

        },
        post: function () {
            var body = {
                title: blogView.elements.title().val(),
                content: Editor.selectors.container().html(),
                file: blogView.inputs.imageFile
            }
            var form = new FormData();
            form.append('imageFile', body.file);
            form.append('content', body.content);
            form.append('title', body.title);
            var client = clientRequester({
                body: form,
                method: "POST",
                url: window.location.origin + "/blogs/post/"
            }, [{
                    name: "progress",
                    func: function (event) {
                        if (event.lengthComputable) {
                            console.log('loading...')
                            let loaded = event.loaded;
                            let total = event.total;
                            LoadingBar.set(loaded, total);
                        }
                        else
                        {
                            LoadingBar.set(100, 100);

                        }
                    }
                },
                {
                    name: "loadstart",
                    func: function (event) {
                        blogView.elements.submitBtns.save().attr('disabled','true');
                    }
                },
                {
                    name: "loadend",
                    func: function (event) {

                    }
                },
                {
                    name:"readystatechange",
                    func: function (event)
                    {
                        var response = event.target.response;
                        console.log('Response = ',response)
                        var jsonResponse = JSON.parse(response);
                        if (!jsonResponse.error)
                        {
                            console.log(jsonResponse.message);
                            let redirect_url = window.location.origin + "/me";
                        window.location.replace(redirect_url);
                        }
                        else
                        {
                            alert(jsonResponse.error);
                        }
                    }
                }
            ])
        }
    }
    blogView.init()
    Editor.init().then(function (){
      console.log('finished !!')
    });


})();

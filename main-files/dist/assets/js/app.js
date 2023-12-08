(function (TynApp) {
    "use strict";

    TynApp.ActiveLink = function(selector, active){
      let elm = document.querySelectorAll(selector);
      let currentURL = document.location.href,
          removeHash = currentURL.substring(0, (currentURL.indexOf("#") == -1) ? currentURL.length : currentURL.indexOf("#")),
          removeQuery = removeHash.substring(0, (removeHash.indexOf("?") == -1) ? removeHash.length : removeHash.indexOf("?")),
          fileName = removeQuery;

      elm && elm.forEach(function(item){
        var selfLink = item.getAttribute('href');
        if (fileName.match(selfLink)) {
          item.parentElement.classList.add(...active);
        } else {
          item.parentElement.classList.remove(...active);
        }
      })
    }

    TynApp.Appbar = function(){
      let elm = document.querySelector('.tyn-appbar');
      if(elm){
        document.querySelector('.tyn-root').style.setProperty('--appbar-height', `${elm.offsetHeight}px`)
      }
    } 
    

    TynApp.Chat.reply.send = function() {
      let chatSend = document.querySelector('#tynChatSend');
      let chatInput = document.querySelector('#tynChatInput');
      let chatReply = document.querySelector('#tynReply');
      let chatBody = document.querySelector('#tynChatBody');

      chatSend && chatSend.addEventListener("click", function(event) {
          event.preventDefault();
          let getInput = chatInput.innerText.trim();

          if (getInput) {
              // Send message to Rasa server
              fetch('http://137.184.190.245:5005/webhooks/rest/webhook', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      message: getInput,
                      sender: 'user' // or any unique user ID
                  })
              })
              .then(response => response.json())
              .then(data => {
                  // Handle Rasa response
                  data.forEach(message => {
                      let botMessage = `
                      <div class="tyn-reply-bubble">
                          <div class="tyn-reply-text">
                              ${message.text}
                          </div>
                      </div>
                      `;
                      chatReply.insertAdjacentHTML("beforeend", botMessage);
                  });

                  // Scroll to the latest message
                  let simpleBody = SimpleBar.instances.get(chatBody);
                  let height = chatBody.querySelector('.simplebar-content > *').scrollHeight;
                  simpleBody.getScrollElement().scrollTop = height;
              })
              .catch(error => {
                  console.error('Error:', error);
                  chatReply.insertAdjacentHTML("beforeend", "<div class='tyn-reply-bubble'><div class='tyn-reply-text'>Sorry, I couldn't fetch the response.</div></div>");
              });

              // Clear the input field
              chatInput.innerHTML = "";
          }
      });

      chatInput && chatInput.addEventListener("keypress", function(event) {
          if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              chatSend.click();
          }
      });
  }

    TynApp.Plugins = {
      lightbox : function(){
        const lightbox = GLightbox({
          touchNavigation: true,
          loop: true,
          autoplayVideos: true
        });
      },
      slider : {
        stories : function(){
          let storiesThumb = document.querySelector('.tyn-stories-thumb');
          let storiesSlider = document.querySelector('.tyn-stories-slider');
          let autoplayDelay = 5000;
          storiesSlider && storiesSlider.querySelector('.swiper-pagination').style.setProperty("--slide-delay", `${autoplayDelay}ms`);
          const thumbCount = storiesThumb && storiesThumb.querySelectorAll('.swiper-slide').length;
          const thumb = new Swiper('.tyn-stories-thumb', {
            slidesPerView: 2,
            freeMode: true,
            cssMode:true,
            spaceBetween:0,
            grid: {
              rows: thumbCount/2,
            },
          });
          const main = new Swiper('.tyn-stories-slider', {
            speed: 400,
            spaceBetween: 0,
            slidesPerView: 1,
            effect: "fade",
            grabCursor: true,
            autoplay: {
              delay: autoplayDelay,
              disableOnInteraction: false,
              waitForTransition:false
            },
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },
            thumbs: {
              swiper: thumb,
            },
            pagination: {
              el: ".swiper-pagination",
              clickable: true,
            },
          });
        },
      },
      clipboard : function() {
        let clipboardTrigger = document.querySelectorAll('.tyn-copy');
        let options = {
          tooltip:{
            init: 'Copy',
            success : 'Copied',
          }
        }
        clipboardTrigger.forEach(item => {
          //init clipboard
          let clipboard = new ClipboardJS(item);
          //set markup
          let initMarkup = `${options.tooltip.init}`;
          let successMarkup = `${options.tooltip.success}`;
          item.innerHTML = initMarkup;
          //on-sucess
          clipboard.on("success", function(e){
            let target = e.trigger;
            target.innerHTML = successMarkup;
            setTimeout(function(){
              target.innerHTML = initMarkup;
            }, 1000)
          });
        });
      }
    }

    TynApp.Theme = function(){
      // Set Theme Function
      function setMode(currentMode){
        localStorage.setItem('connectme-html', currentMode);
        document.documentElement.setAttribute("data-bs-theme", currentMode);
      }
      // Set Theme On Load
      setMode(localStorage.getItem('connectme-html'));

      var themeModeToggle = document.getElementsByName('themeMode');
      themeModeToggle.forEach((item) =>{
        (item.value == localStorage.getItem('connectme-html')) && (item.checked = true);
        item.addEventListener('change', function(){
            if(item.checked && item.value){
              setMode(item.value);
            }
        })
      })
    }

    TynApp.Custom.init = function(){
      TynApp.Chat.reply.search();
      TynApp.Chat.reply.scroll();
      TynApp.Chat.reply.input();
      TynApp.Chat.reply.quick();
      TynApp.Chat.reply.send();
      TynApp.Chat.item();
      TynApp.Chat.mute();
      TynApp.Chat.aside();
      TynApp.Chat.botsend();
      TynApp.ActiveLink('.tyn-appbar-link', ['active', 'current-page']);
      TynApp.Appbar();
      TynApp.Theme();
  }

  TynApp.Plugins.init = function(){
      TynApp.Plugins.lightbox();
      TynApp.Plugins.slider.stories();
      TynApp.Plugins.clipboard();
  }

  TynApp.init = function(){
      TynApp.Load(TynApp.Custom.init);
      TynApp.Load(TynApp.Plugins.init);
      TynApp.Resize(TynApp.Appbar);
  }

  TynApp.init();

  return TynApp;
})(TynApp || {});

//end-js
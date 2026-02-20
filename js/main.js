document.addEventListener("DOMContentLoaded", function() {

    function isIntersectionObserverSupported() {
        return ('IntersectionObserver' in window) && 
               ('IntersectionObserverEntry' in window) && 
               ('intersectionRatio' in window.IntersectionObserverEntry.prototype);
    }

    function loadImage(image) {
        if (image.dataset.src) {
            image.src = image.dataset.src;
            image.removeAttribute('data-src');
        }
    }

    function loadPicture(picture) {
        const sources = picture.querySelectorAll('source[data-srcset]');
        const img = picture.querySelector('img');
        if (!img) return;

        let selectedSrc = null;

        sources.forEach(source => {
            const media = source.getAttribute('media');
            const srcset = source.dataset.srcset;
            if (srcset && media && window.matchMedia(media).matches) {
                selectedSrc = srcset;
            }
            source.srcset = srcset;
            source.removeAttribute('data-srcset');
        });

        if (selectedSrc) {
            img.src = selectedSrc;
        } else if (img.dataset.src) {
            img.src = img.dataset.src;
        }
        img.removeAttribute('data-src');
    }

    function loadAllImagesInContainer(container) {
        if (!container) return;

        container.querySelectorAll('picture').forEach(picture => {
            loadPicture(picture);
        });

        container.querySelectorAll('img[data-src]:not(picture img)').forEach(img => {
            loadImage(img);
        });
    }

    function setupSwiperLazyLoading() {
        const bathroomSliderElement = document.querySelector('.bathroomSwiper');
        if (bathroomSliderElement && bathroomSliderElement.swiper) {
            const swiper = bathroomSliderElement.swiper;

            swiper.slides.forEach(slide => {
                loadAllImagesInContainer(slide);
            });

            swiper.on('slideChange', function() {
                const slidesToLoad = [
                    this.slides[this.activeIndex],
                    this.slides[this.activeIndex + 1],
                    this.slides[this.activeIndex - 1]
                ];
                slidesToLoad.forEach(slide => {
                    if (slide) loadAllImagesInContainer(slide);
                });
            });
        }

        const mainSliderElement = document.querySelector('.mySwiper_banner');
        if (mainSliderElement && mainSliderElement.swiper) {
            const swiper = mainSliderElement.swiper;

            swiper.slides.forEach(slide => {
                loadAllImagesInContainer(slide);
            });

            swiper.on('slideChange', function() {
                loadAllImagesInContainer(this.slides[this.activeIndex]);
            });
        }

        const listSliderElement = document.querySelector('.mySwiper_list');
        if (listSliderElement && listSliderElement.swiper) {
            const swiper = listSliderElement.swiper;

            swiper.slides.forEach(slide => {
                loadAllImagesInContainer(slide);
            });

            swiper.on('slideChange', function() {
                loadAllImagesInContainer(this.slides[this.activeIndex]);
            });
        }
    }

    function setupStaticLazyLoading() {
        const lazyPictures = document.querySelectorAll('picture:has(source[data-srcset])');
        const lazyImages = document.querySelectorAll('img[data-src]:not(picture img)');

        const allLazy = [...lazyPictures, ...lazyImages];

        if (allLazy.length === 0) return;

        if (isIntersectionObserverSupported()) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    const el = entry.target;
                    if (el.tagName === 'PICTURE') {
                        loadPicture(el);
                    } else if (el.tagName === 'IMG') {
                        loadImage(el);
                    }

                    obs.unobserve(el);
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            allLazy.forEach(el => observer.observe(el));
        } else {
            let timeout;
            function handler() {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(() => {
                    const wh = window.innerHeight;
                    allLazy.forEach(el => {
                        const rect = el.getBoundingClientRect();
                        if (rect.top < wh + 100 && rect.bottom > -100) {
                            if (el.tagName === 'PICTURE') loadPicture(el);
                            else if (el.tagName === 'IMG') loadImage(el);
                        }
                    });
                }, 100);
            }
            window.addEventListener('scroll', handler);
            window.addEventListener('resize', handler);
            handler();
        }
    }

    setTimeout(setupSwiperLazyLoading, 1000);
    setTimeout(setupStaticLazyLoading, 500);

    function setVh() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    setVh();

    const body = document.body;
    const html = document.documentElement;
    const header = document.querySelector('.header');
    const isMobile = window.innerWidth < 768;

    // const mainBlockSlider = document.querySelector('.main_block_slider');
    // if (mainBlockSlider) {
        
    //     const mainSwiper = new Swiper('.mySwiper_banner', {
    //         spaceBetween: 0,
    //         loop: true,
    //         lazy: true,
    //         speed: 600,
    //         effect: isMobile ? "fade" : "slide",
    //         fadeEffect: {
    //             crossFade: true
    //         },
    //         navigation: {
    //             nextEl: ".main_block_slider .arrow_btn.next",
    //             prevEl: ".main_block_slider .arrow_btn.prev",
    //         },
    //         on: {
    //             slideChangeTransitionStart: function() {
    //                 if (!isMobile) {
    //                     const activeSlide = this.slides[this.activeIndex];
    //                     const direction = this.swipeDirection;
                        
    //                     this.slides.forEach(slide => {
    //                         slide.classList.remove('bounceInLeft', 'bounceInRight');
    //                     });
                        
    //                     if (direction === 'next' || !direction) {
    //                         activeSlide.classList.add('bounceInRight');
    //                     } else {
    //                         activeSlide.classList.add('bounceInLeft');
    //                     }
    //                 }
    //             }
    //         }
    //     });
    // }

    let ytAPIReady = false;
    const ytPlayers = {};
    const ytPendingSlides = [];

    function loadYouTubeAPI() {
        if (document.getElementById('yt-api-script')) return;
        const tag = document.createElement('script');
        tag.id = 'yt-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = function () {
        ytAPIReady = true;
        ytPendingSlides.forEach(({ slideEl, videoId }) => initYTPlayer(slideEl, videoId));
        ytPendingSlides.length = 0;
    };

    function initYTPlayer(slideEl, videoId) {
        const containerId = `yt-player-${videoId}`;
        if (ytPlayers[containerId]) return;
        ytPlayers[containerId] = new YT.Player(containerId, {
            videoId,
            playerVars: {
                autoplay: 0,
                mute: 1,
                controls: 0,
                disablekb: 1,
                loop: 1,
                playlist: videoId,
                modestbranding: 0,
                showinfo: 1,
                rel: 1,
                fs: 1,
                iv_load_policy: 3,
                playsinline: 0
            },
            events: {
                onReady(e) {
                    slideEl._ytPlayer = e.target;
                    if (slideEl.classList.contains('swiper-slide-active')) {
                        e.target.playVideo();
                    }
                }
            }
        });
    }

    // --- Rutube postMessage ---
    function postMessageToIframe(iframe, type, data = {}) {
        if (!iframe) return;
        iframe.contentWindow.postMessage(JSON.stringify({ type, data }), '*');
    }

    // --- Play / Pause ---
    function playSlideVideo(slide) {
        const type = slide.dataset.videoType;
        if (!type) return;

        if (type === 'html') {
            const video = slide.querySelector('video.slide-video');
            if (video) {
                if (video.dataset.src && !video.getAttribute('src')) {
                    video.setAttribute('src', video.dataset.src);
                    video.load();
                }
                video.play().catch(() => {});
            }

        } else if (type === 'youtube') {
            if (slide._ytPlayer) {
                slide._ytPlayer.playVideo();
            }

        } else if (type === 'rutube') {
            const iframe = document.getElementById(`rt-player-${slide.dataset.videoId}`);
            postMessageToIframe(iframe, 'player:play', {});
        }
    }

    function pauseSlideVideo(slide) {
        const type = slide.dataset.videoType;
        if (!type) return;

        if (type === 'html') {
            const video = slide.querySelector('video.slide-video');
            if (video) video.pause();

        } else if (type === 'youtube') {
            if (slide._ytPlayer) slide._ytPlayer.pauseVideo();

        } else if (type === 'rutube') {
            const iframe = document.getElementById(`rt-player-${slide.dataset.videoId}`);
            postMessageToIframe(iframe, 'player:pause', {});
        }
    }

    // --- Инициализация ---
    function initSlideVideos(swiper) {
        let needYT = false;

        swiper.slides.forEach(slide => {
            const type = slide.dataset.videoType;
            if (!type) return;

            if (type === 'youtube') {
                needYT = true;
                const videoId = slide.dataset.videoId;
                if (ytAPIReady) {
                    initYTPlayer(slide, videoId);
                } else {
                    ytPendingSlides.push({ slideEl: slide, videoId });
                }
            }
        });

        if (needYT) loadYouTubeAPI();
    }


    const mainBlockSlider = document.querySelector('.main_block_slider');
    if (mainBlockSlider) {

        const mainSwiper = new Swiper('.mySwiper_banner', {
            spaceBetween: 0,
            loop: true,
            lazy: true,
            speed: 600,
            effect: isMobile ? 'fade' : 'slide',
            fadeEffect: { crossFade: true },
            navigation: {
                nextEl: '.main_block_slider .arrow_btn.next',
                prevEl: '.main_block_slider .arrow_btn.prev',
            },
            on: {
                init(swiper) {
                    initSlideVideos(swiper);
                    playSlideVideo(swiper.slides[swiper.activeIndex]);
                },
                slideChangeTransitionStart(swiper) {
                    pauseSlideVideo(swiper.slides[swiper.previousIndex]);

                    if (!isMobile) {
                        const activeSlide = swiper.slides[swiper.activeIndex];
                        const direction = swiper.swipeDirection;

                        swiper.slides.forEach(slide => {
                            slide.classList.remove('bounceInLeft', 'bounceInRight');
                        });

                        activeSlide.classList.add(
                            direction === 'prev' ? 'bounceInLeft' : 'bounceInRight'
                        );
                    }
                },
                slideChangeTransitionEnd(swiper) {
                    playSlideVideo(swiper.slides[swiper.activeIndex]);
                }
            }
        });
    }
            
    const bathroomSlider = document.querySelector('.bathroomSwiper');

    if (bathroomSlider) {
        const bathroomSwiper = new Swiper('.bathroomSwiper', {
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            spaceBetween: 0,
            loop: true,
            lazy: true,
            speed: 800,
            effect: isMobile ? "fade" : "slide",
            navigation: {
                nextEl: ".block_slider .arrow_btn.next",
                prevEl: ".block_slider .arrow_btn.prev",
            },
            breakpoints: {
                0: {
                  slidesPerView: 1
                },
                768: {
                    slidesPerView: 'auto',
                    spaceBetween: 0,
                }                
            },
            on: {
                slideChangeTransitionStart: function() {
                    if (!isMobile) {
                        const activeSlide = this.slides[this.activeIndex];
                        const direction = this.swipeDirection;
                        
                        this.slides.forEach(slide => {
                            slide.classList.remove('bounceInLeft', 'bounceInRight');
                        });
                        
                        if (direction === 'next' || !direction) {
                            activeSlide.classList.add('bounceInRight');
                        } else {
                            activeSlide.classList.add('bounceInLeft');
                        }
                    }
                }
            }
        });
    }

    const listBlockSlider = document.querySelector('.block_slider_list');
    if (listBlockSlider) {
        document.querySelectorAll('.mySwiper_list .swiper-slide').forEach(slide => {
          const colCount = slide.querySelectorAll('.list').length;
          slide.classList.add(`cols-${colCount}`);
        });

        const listSwiper = new Swiper('.mySwiper_list', {
            spaceBetween: 0,
            loop: true,
            lazy: true,
            speed: 500,
            navigation: {
                nextEl: ".block_slider_list .arrow_btn.next",
                prevEl: ".block_slider_list .arrow_btn.prev",
            },
            effect: "fade",
            simulateTouch: !isMobile,
            allowTouchMove: !isMobile, 
            slidesPerView: 1,
            loopedSlides: 1,
        });
    }

    const nameElements = document.querySelectorAll('.block_slider_list .name');

    if (nameElements.length) {
        const images = document.querySelectorAll('.block_slider_list .images .image');
        
        nameElements.forEach(nameElement => {
            nameElement.addEventListener('mouseenter', function() {
                const hoveredName = this.textContent.trim();

                images.forEach(img => {
                    img.classList.remove('active');
                });
                
                const targetImage = document.querySelector(`.block_slider_list .images .image[data-name="${hoveredName}"]`);
                if (targetImage) {
                    targetImage.classList.add('active');
                }
            });
            
            nameElement.addEventListener('mouseleave', function() {
                images.forEach(img => {
                    img.classList.remove('active');
                });
                if (images[0]) {
                    images[0].classList.add('active');
                }
            });
        });
        
        // const innerElements = document.querySelectorAll('.block_slider_list .inner');
        // innerElements.forEach(inner => {
        //     inner.addEventListener('mouseleave', function() {
        //         images.forEach(img => {
        //             img.classList.remove('active');
        //         });
        //         if (images[0]) {
        //             images[0].classList.add('active');
        //         }
        //     });
        // });
    }

    const searchBtn = document.querySelector('.search_btn');

    if(searchBtn){
        searchWrap = document.querySelector('.search_form_block');

        searchBtn.addEventListener('click', function(){
            searchWrap.classList.toggle('opened');
        })
    }

    const searchBtnMobile = document.querySelector('.search_btn_mobile');

    if(searchBtnMobile){
        searchWrapMobile = document.querySelector('.search_form');

        searchBtnMobile.addEventListener('click', function(){
            searchWrapMobile.classList.toggle('active');
        })
    }

    const categoryMobileBtn = document.querySelector('.category_mobile');

    if(categoryMobileBtn){
        const menuBlockMobile = document.querySelector('.menu_block');
        const menuBlockBack = document.querySelector('.back_btn');

        categoryMobileBtn.addEventListener('click', function(event){
            event.preventDefault();
            menuBlockMobile.classList.add('active_categor');
        });

        menuBlockBack.addEventListener('click', function(event){
            event.preventDefault();
            menuBlockMobile.classList.remove('active_categor');
        });
    }

    const menuList = document.querySelectorAll('.right_menu ul li a .arrow');

    if(menuList.length){
        menuList.forEach(function(arrow) {
            arrow.addEventListener('click', function(event) {
                event.preventDefault();

                const currentLi = this.closest('li');

                const siblings = Array.from(currentLi.parentElement.children)
                  .filter(el => el !== currentLi);

                siblings.forEach(function(li) {
                  li.classList.remove('hasSubmenu');
                });

                currentLi.classList.toggle('hasSubmenu');
            });
        });
    }

    const burger = document.querySelector('.burger');
    const burgerMenu = document.querySelector('.burger_menu');
    const burgerClose = document.querySelector('.burger_menu .close');

    burger.addEventListener('click', function(){
        burgerMenu.classList.add('opened');
        html.classList.add('oveflowHidden')
    });

    burgerClose.addEventListener('click', function(){
        burgerMenu.classList.remove('opened');
        html.classList.remove('oveflowHidden')
    });

    $('[data-remodal-target="subscribe-popup"]').on('click', function(e) {
        var email = $('#main-email').val();
        $('#modal-email').val(email);
    });
    
    $('.field_form .btn_button').on('click', function(e) {
        var email = $('#main-email').val();
        if (!email || !isValidEmail(email)) {
            e.preventDefault();
            $('#main-email').focus();
        }
    });
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    $('#subscribe-form').on('submit', function(e) {
        e.preventDefault();
        
        var formData = $(this).serialize();
        
        $.ajax({
            url: $(this).attr('action'),
            type: 'POST',
            data: formData,
            success: function(response) {
                var inst = $('[data-remodal-id="subscribe-popup"]').remodal();
                inst.close();
                
                alert('Спасибо за подписку!');
            },
            error: function() {
                alert('Произошла ошибка. Попробуйте позже.');
            }
        });
    });

    function initStackingSections() {
        const sections = Array.from(document.querySelectorAll('.section_block'));
        let currentIndex = 0;
        let isAnimating = false;

        sections.forEach((section, i) => {
            section.style.zIndex = i + 1;
            if (i === 0) {
                section.style.transform = 'translateY(0)';
            } else {
                section.style.transform = 'translateY(100%)';
            }
            section.style.transition = 'transform 0.7s cubic-bezier(0.77, 0, 0.18, 1)';
        });

        function goToNext() {
            if (isAnimating || currentIndex >= sections.length - 1) return;
            isAnimating = true;

            const next = sections[currentIndex + 1];
            next.style.transform = 'translateY(0)';

            currentIndex++;
            setTimeout(() => { isAnimating = false; }, 700);
        }

        function goToPrev() {
            if (isAnimating || currentIndex <= 0) return;
            isAnimating = true;

            const current = sections[currentIndex];
            current.style.transform = 'translateY(100%)';

            currentIndex--;
            setTimeout(() => { isAnimating = false; }, 700);
        }

        window.addEventListener('wheel', (e) => {
            if (e.deltaY > 0) goToNext();
            else goToPrev();
        }, { passive: true });

        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            const delta = touchStartY - e.changedTouches[0].clientY;
            if (Math.abs(delta) > 50) {
                if (delta > 0) goToNext();
                else goToPrev();
            }
        }, { passive: true });
    }

    initStackingSections();
    
});
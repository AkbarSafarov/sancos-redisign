document.addEventListener("DOMContentLoaded", function() {

    const body = document.body;
    const html = document.documentElement;
    const header = document.querySelector('.header');

    const mainBlockSlider = document.querySelector('.main_block_slider');
    if (mainBlockSlider) {
        const mainSwiper = new Swiper('.mySwiper_banner', {
            spaceBetween: 0,
            loop: true,
            speed: 500,
            navigation: {
                nextEl: ".main_block_slider .arrow_btn.next",
                prevEl: ".main_block_slider .arrow_btn.prev",
            },
            on: {
                slideChangeTransitionStart: function() {
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
            speed: 800,
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
        });
    }

    const listBlockSlider = document.querySelector('.block_slider_list');
    if (listBlockSlider) {
        const listSwiper = new Swiper('.mySwiper_list', {
            spaceBetween: 0,
            loop: true,
            speed: 500,
            navigation: {
                nextEl: ".block_slider_list .arrow_btn.next",
                prevEl: ".block_slider_list .arrow_btn.prev",
            },
            effect: "fade",
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
        });
        
        const innerElements = document.querySelectorAll('.block_slider_list .inner');
        innerElements.forEach(inner => {
            inner.addEventListener('mouseleave', function() {
                images.forEach(img => {
                    img.classList.remove('active');
                });
                if (images[0]) {
                    images[0].classList.add('active');
                }
            });
        });
    }

    const searchBtn = document.querySelector('.search_btn');

    if(searchBtn){
        searchWrap = document.querySelector('.search_form_block');

        searchBtn.addEventListener('click', function(){
            searchWrap.classList.toggle('opened');
        })
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
});
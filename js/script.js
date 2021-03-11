const EFFECT_PAGE_LIST = [
    {
        name: 'magnetic-ball',
        path: '/effects/magnetic-ball/index.html'
    },
    {
        name: 'ripple',
        path: '/effects/ripple/index.html'
    },
];
let selectedIndex = 0;
const IFRAME = document.getElementById('iframe');
const LOCATION_HREF = location.href.match(/(.+)\/index/)[1];
let isResize = false;
window.addEventListener('resize', () => {
    if (!isResize) {
        isResize = true;
        resize();
        setTimeout(() => {
            isResize = false;
        }, 100);
    }
});
init();
function init() {
    resize();
    bindMenuEvent();
}
function resize() {
    setIframe();
}
function setIframe() {
    IFRAME.setAttribute('width', window.innerWidth.toString());
    IFRAME.setAttribute('height', window.innerHeight.toString());
}
function bindMenuEvent() {
    const menu = document.getElementById('menu');
    const menuBtn = menu.querySelector('.menu-btn');
    const menuList = menu.querySelector('.menu-list');
    menuBtn.addEventListener('click', () => {
        if (menu.classList.contains('active')) {
            menu.classList.remove('active');
        }
        else {
            menu.classList.add('active');
        }
    });
    EFFECT_PAGE_LIST.forEach((pageData, i) => {
        const item = document.createElement('div');
        item.classList.add('menu-item');
        item.textContent = pageData.name.toLocaleUpperCase();
        if (i === selectedIndex) {
            item.classList.add('active');
            IFRAME.setAttribute('src', LOCATION_HREF + pageData.path);
        }
        item.addEventListener('click', () => {
            if (i !== selectedIndex) {
                selectedIndex = i;
                IFRAME.setAttribute('src', LOCATION_HREF + pageData.path);
                const itemList = menuList.querySelectorAll('.menu-item');
                for (let i = 0; i < itemList.length; i++) {
                    const dom = itemList[i];
                    dom.classList.remove('active');
                }
                itemList[i].classList.add('active');
            }
            menu.classList.remove('active');
        });
        menuList.appendChild(item);
    });
}

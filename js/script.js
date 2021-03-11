var EFFECT_PAGE_LIST = [
    {
        name: 'magnetic-ball',
        path: '/effects/magnetic-ball/index.html'
    },
    {
        name: 'ripple',
        path: '/effects/ripple/index.html'
    },
];
var selectedIndex = 0;
var IFRAME = document.getElementById('iframe');
var isResize = false;
window.addEventListener('resize', function () {
    if (!isResize) {
        isResize = true;
        resize();
        setTimeout(function () {
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
    var menu = document.getElementById('menu');
    var menuBtn = menu.querySelector('.menu-btn');
    var menuList = menu.querySelector('.menu-list');
    menuBtn.addEventListener('click', function () {
        if (menu.classList.contains('active')) {
            menu.classList.remove('active');
        }
        else {
            menu.classList.add('active');
        }
    });
    EFFECT_PAGE_LIST.forEach(function (pageData, i) {
        var item = document.createElement('div');
        item.classList.add('menu-item');
        item.textContent = pageData.name.toLocaleUpperCase();
        if (i === selectedIndex) {
            item.classList.add('active');
            IFRAME.setAttribute('src', pageData.path);
        }
        item.addEventListener('click', function () {
            if (i !== selectedIndex) {
                selectedIndex = i;
                IFRAME.setAttribute('src', pageData.path);
                var itemList = menuList.querySelectorAll('.menu-item');
                for (var i_1 = 0; i_1 < itemList.length; i_1++) {
                    var dom = itemList[i_1];
                    dom.classList.remove('active');
                }
                itemList[i].classList.add('active');
            }
            menu.classList.remove('active');
        });
        menuList.appendChild(item);
    });
}

interface BallEvent {
    mousemove?: ((event: MouseEvent) => {})[];
    mouseenter?: ((event: MouseEvent) => {})[];
    mouseleave?: ((event: MouseEvent) => {})[];
    click?: ((event: MouseEvent) => {})[];
}
interface BallOption {
    size: {
        width: number;
        height: number;
    };
    innerDOM: HTMLElement;
}

interface Size {
    width: number;
    height: number;
}

interface Position {
    x: number;
    y: number;
}

((MagneticBall) => {
    const AllBallList = [];
    const ballBaseStyleId = 'magnetic-ball-base-style';
    const time = new Date().getTime();
    let isStart = false;
    function animationFrame() {
        if (!isStart) {
            return;
        }
        AllBallList.forEach(ball => {
            ball.goTo(ball.mousePos);
        })
        window.requestAnimationFrame(animationFrame);
    }

    // 判斷有沒有導入預設樣式
    if (!document.getElementById(ballBaseStyleId)) {
        const style = document.createElement('style');
        const css = `
        .ball-container-${time} {
            border-radius: 50%;
            position: relative;
        }
        .ball-container-${time}.is-ball-hover {
            cursor: pointer
        }
        .ball-container-${time} .ball-${time} {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30%;
            height: 30%;
            border: solid 2px #333;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }`;
        style.type = 'text/css';
        style.id = ballBaseStyleId;
        style.appendChild(document.createTextNode(css));
        const oldStyleDOM = document.getElementsByTagName('style');
        const head = document.head || document.getElementsByTagName('head')[0];
        if (!oldStyleDOM[0]) {
            head.appendChild(style);
        } else {
            head.insertBefore(style, oldStyleDOM[0]);
        }
    }

    MagneticBall.Ball = class {
        constructor(ballOption: BallOption) {
            this.size = JSON.parse(JSON.stringify(ballOption.size));
            this.innerDOM = ballOption.innerDOM;
            this.targetSize = {
                width: ballOption.size.width * 10 / 3,
                height: ballOption.size.height * 10 / 3
            };
            // 將頁面上所有的球存進 AllBallList

            AllBallList.push(this);
            this.init();
        }
        autoPos = true;
        private size: Size = null;
        private targetDOM: HTMLElement;
        private ballDOM: HTMLElement;
        private innerDOM: HTMLElement = null;
        private targetSize: Size = null;
        private position = {
            x: 0, y: 0
        }
        private goToPosition = {
            x: 0, y: 0
        }
        private mousePos = {
            x: 0, y: 0
        }
        private speed: number = 0.7;
        private elastic: number = 0.03;
        private friction: number = 0.9;
        private isInit: boolean = false;
        private isEnter: boolean = false;
        private isHoverBall: boolean = false;
        private isAnmation: boolean = false;
        private centerTimes: number = 0;
        private eventList: BallEvent = {
            mousemove: [],
            mouseenter: [],
            mouseleave: [],
            click: []
        };


        private init() {
            // 創建DOM
            this.targetDOM = document.createElement('div');
            this.targetDOM.classList.add(`ball-container-${time}`);
            this.targetDOM.style.width = this.targetSize.width + 'px';
            this.targetDOM.style.height = this.targetSize.height + 'px';
            this.ballDOM = document.createElement('div');
            this.ballDOM.classList.add(`ball-${time}`);
            if (this.innerDOM) {
                this.ballDOM.appendChild(this.innerDOM);
            }
            this.targetDOM.appendChild(this.ballDOM);
            // 綁定事件
            ['mousemove', 'mouseenter', 'mouseleave', 'click'].forEach(key => {
                this.targetDOM.addEventListener(key, (e) => { this[`_${key}Event`](e) });
            });
            this.isInit = true;
            // if (this.eventList.onInit) {
            //     this.eventList.onInit(this);
            // }
        }
        destroy() {
            this.isInit = false;
            this.remove();
            // 移除prototype元件
            const index = AllBallList.indexOf(this);
            console.log(index);
            AllBallList.splice(index, 1);
            ['mousemove', 'mouseenter', 'mouseleave', 'click'].forEach(key => {
                this.targetDOM.removeEventListener(key, this[`_${key}Event`])
            });
            this.targetDOM = null;
            this.ballDOM = null;
            // if (this.eventList.onDestroy) {
            //     this.eventList.onDestroy(this);
            // }
        }
        addTo(dom) {
            if (!this.targetDOM || !this.ballDOM) {
                this.init();
            }
            dom.appendChild(this.targetDOM);
        }
        remove() {
            if (this.targetDOM.parentElement) {
                this.targetDOM.parentElement.removeChild(this.targetDOM)
            }
        }
        goTo(pos) {
            if (!this.isInit || !this.isAnmation) {
                return;
            }
            const centerLength = Math.hypot(pos.x, pos.y);
            // 判斷需不需要計算彈力係數
            // 如果未進入出發範圍不需要彈力係數
            if (
                !this.isHoverBall &&
                (centerLength > this.size.width * 1.2) &&
                (pos.x !== 0 || pos.y !== 0)
            ) {
                this.position.x += (pos.x * 0.3 - this.position.x) * this.speed * 0.05;
                this.position.y += (pos.y * 0.3 - this.position.y) * this.speed * 0.05;
            } else {
                // 滑鼠進入主要的球
                this.isHoverBall = true;
                // 計算彈力
                this.goToPosition.x += (pos.x - this.position.x) * this.elastic;
                this.goToPosition.y += (pos.y - this.position.y) * this.elastic;
                // 摩擦力
                this.goToPosition.x *= this.friction;
                this.goToPosition.y *= this.friction;
                // 速度
                this.position.x += this.goToPosition.x * this.speed;
                this.position.y += this.goToPosition.y * this.speed;

                if (!this.isEnter && this.position.x < 0.000001 && this.position.y < 0.000001) {
                    this.centerTimes++;
                    if (this.centerTimes > 50) {
                        this.centerTimes = 0;
                        this.isAnmation = false;
                    }
                }
            }
            const innerPos = {
                x: this.position.x,
                y: this.position.y
            }
            this.ballDOM.style.transform = `translate(calc(-50% + ${innerPos.x}px) , calc(-50% + ${innerPos.y}px))`;
        }
        addEventListener(name, fn) {
            const eventList = this.eventList[name] || (this.eventList[name] = []);
            eventList.push(fn);
        }
        removeEventListener(name, fn) {
            const eventList: any[] = this.eventList[name] || (this.eventList[name] = []);
            const index = eventList.indexOf(fn);
            if (index > -1) {
                eventList.splice(index, 0);
            }
        }
        private _mousemoveEvent(e) {
            const posData = this.targetDOM.getBoundingClientRect();
            this.mousePos.x = e.x - posData.x - this.targetSize.width / 2;
            this.mousePos.y = e.y - posData.y - this.targetSize.height / 2;
            if (this.isHoverBall) {
                this.targetDOM.classList.add('is-ball-hover');
            } else {
                this.targetDOM.classList.remove('is-ball-hover');
            }
            if (this.eventList.mousemove) {
                this.eventList.mousemove.forEach(fn => { fn(e) });
            }
        }
        private _mouseenterEvent(e) {
            this.isHoverBall = false;
            this.isAnmation = true;
            this.isEnter = true;
            this.centerTimes = 0;
            if (this.eventList.mouseenter) {
                this.eventList.mouseenter.forEach(fn => { fn(e) });
            }
        }
        private _mouseleaveEvent(e) {
            this.mousePos.x = 0;
            this.mousePos.y = 0;
            this.isHoverBall = false;
            this.isEnter = false;
            this.targetDOM.classList.remove('is-ball-hover');
            if (this.eventList.mouseleave) {
                this.eventList.mouseleave.forEach(fn => { fn(e) });
            }
        }
        private _clickEvent(e) {
            if (this.isHoverBall && this.eventList.click) {
                this.eventList.click.forEach(fn => { fn(e) });
            }
        }
    };

    MagneticBall.start = () => {
        if (!isStart) {
            isStart = true;
            animationFrame();
        }
    };
    
    MagneticBall.stop = () => {
        isStart = false;
    };


    

})(window['MagneticBall'] || (window['MagneticBall'] = {}));
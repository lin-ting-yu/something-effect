interface RippleSetting {
    speed?: number;
    maxSize?: number;
    rippleDark?: number[];
    rippleLight?: number[];
}

interface Ripple {
    init: (setting: RippleSetting) => void;
    destroy: () => void;
    start: () => void;
    stop: () => void;
    setting: (setting: RippleSetting) => void;
    getRipple: (dom: HTMLElement) => void;
    appendTo: (dom: HTMLElement) => void;
    removeFrom: (dom: HTMLElement) => void;
    resize: () => void;
}

interface PointData {
    x: number;
    y: number;
    size: number;
}

interface RippleData {
    parent: HTMLElement;
    canvas: HTMLCanvasElement;
    pointList: PointData[];
    size: {
        width: number;
        height: number;
    };
    event: {
        resize: () => void;
        mousedown: (event: MouseEvent) => void;
        touchstart: (event: TouchEvent) => void;
    };
}

((ripple: Ripple) => {
    let rippleSetting: RippleSetting = {
        speed: 4,
        maxSize: null,
        rippleDark: [0, 0, 0],
        rippleLight: [255, 255, 255]
    }
    let isStart = false;
    const PI2 = Math.PI * 2;
    const parentMap: Map<HTMLElement, RippleData> = new Map();
    const setStyle = (canvas: HTMLElement, styleObj: { [style: string]: string }) => {
        Object.keys(styleObj).forEach(styleName => {
            canvas.style[styleName] = styleObj[styleName];
        });
    }

    const pushPoint = (rippleData: RippleData, x: number, y: number) => {
        rippleData.pointList.push({ x, y, size: 0 });
    }

    const animation = () => {
        if (!isStart) {
            return;
        }
        requestAnimationFrame(animation);
        parentMap.forEach(rippleData => {
            const ctx: CanvasRenderingContext2D = rippleData.canvas.getContext('2d');
            const maxSize = rippleSetting.maxSize || Math.sqrt(rippleData.size.width ** 2 + rippleData.size.height ** 2);
            const newPointList: PointData[] = [];
            const pos = rippleData.size.width * window.devicePixelRatio * 3;
            ctx.clearRect(0, 0, rippleData.size.width * window.devicePixelRatio, rippleData.size.height * window.devicePixelRatio);
            // rippleData.event.resize();
            rippleData.pointList.forEach((pointData) => {
                const lineWidth = (10 + pointData.size / 100) * window.devicePixelRatio;
                ctx.beginPath();
                ctx.fillStyle = 'black';
                ctx.arc(
                    -pos,
                    pointData.y * window.devicePixelRatio,
                    pointData.size * window.devicePixelRatio,
                    0, PI2
                );

                ctx.lineWidth = lineWidth;
                ctx.shadowBlur = lineWidth * 2;
                ctx.shadowColor = `rgba(${rippleSetting.rippleDark[0]}, ${rippleSetting.rippleDark[1]}, ${rippleSetting.rippleDark[2]}, ${(1 - pointData.size / maxSize) / 3})`;
                ctx.shadowOffsetX = pos + pointData.x * window.devicePixelRatio + lineWidth;
                ctx.shadowOffsetY = lineWidth;
                ctx.stroke();
                ctx.shadowColor = `rgba(${rippleSetting.rippleLight[0]}, ${rippleSetting.rippleLight[1]}, ${rippleSetting.rippleLight[2]}, ${(1 - pointData.size / maxSize) / 3})`;
                ctx.shadowOffsetX = pos + pointData.x * window.devicePixelRatio - lineWidth;
                ctx.shadowOffsetY = -lineWidth;
                ctx.stroke();
                ctx.closePath();
                if (pointData.size <= maxSize) {
                    newPointList.push(pointData);
                }
                pointData.size += rippleSetting.speed;
            });
            rippleData.pointList = newPointList;
        })
    }

    ripple.appendTo = (parent: HTMLElement) => {
        if (!parentMap.has(parent)) {
            if (window.getComputedStyle(parent).position === 'static') {
                console.warn('parent\'s position can not be static', parent);
            }

            const rect = parent.getBoundingClientRect();
            const canvas = document.createElement('canvas');
            const size = {
                width: rect.width,
                height: rect.height
            }
            canvas.width = size.width * window.devicePixelRatio;
            canvas.height = size.height * window.devicePixelRatio;

            const rippleData: RippleData = {
                parent,
                canvas,
                pointList: [],
                size,
                event: {
                    resize: () => {
                        console.log('asas')
                        const eventRect = parent.getBoundingClientRect();
                        const size = {
                            width: eventRect.width,
                            height: eventRect.height
                        }
                        canvas.width = size.width * window.devicePixelRatio;
                        canvas.height = size.height * window.devicePixelRatio;
                        rippleData.size = size;
                    },
                    mousedown: (event: MouseEvent) => {
                        pushPoint(rippleData, event.offsetX, event.offsetY);
                    },
                    touchstart: (event: TouchEvent) => {
                        const eventRect = parent.getBoundingClientRect();
                        let x = event.targetTouches[0].pageX - eventRect.left;
                        let y = event.targetTouches[0].pageY - eventRect.top;
                        pushPoint(rippleData, x, y);
                    }
                }
            }

            setStyle(
                canvas,
                {
                    width: '100%',
                    height: '100%',
                    zIndex: '99',
                    pointerEvents: 'none',
                    position: 'absolute'
                }
            );

            parent.addEventListener('mousedown', rippleData.event.mousedown);
            parent.addEventListener('touchstart', rippleData.event.touchstart);

            parentMap.set(parent, rippleData);

            parent.appendChild(canvas);
        } else {
            throw 'this parent has ripple';
        }
    };
    ripple.removeFrom = (parent: HTMLElement) => {
        if (!parentMap.has(parent)) {
            const rippleData = parentMap.get(parent);
            parent.removeChild(rippleData.canvas);
            parent.removeEventListener('mousedown', rippleData.event.mousedown);
            parent.removeEventListener('touchstart', rippleData.event.touchstart);
            parentMap.delete(parent);
        }
    }
    ripple.getRipple = (parent: HTMLElement) => {
        return parentMap.has(parent) || null;
    }
    ripple.setting = (newSetting: RippleSetting) => {
        Object.keys(newSetting).forEach(key => {
            rippleSetting[key] = newSetting[key];
        })
    }
    ripple.init = (newSetting?: RippleSetting) => {
        if (newSetting) {
            ripple.setting(newSetting);
        }
        ripple.start();
    }
    ripple.destroy = () => {
        isStart = false;
        parentMap.forEach(rippleData => {
            ripple.removeFrom(rippleData.parent);
        })
    }
    ripple.stop = () => {
        isStart = false;
    }
    ripple.start = () => {
        if (!isStart) {
            isStart = true;
            animation();
        }
    }
    ripple.resize = () => {
        parentMap.forEach(rippleData => {
            rippleData.event.resize();
        })
    }
})(window['ripple'] || (window['ripple'] = {}));
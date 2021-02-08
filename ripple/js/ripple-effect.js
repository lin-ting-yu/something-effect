((ripple) => {
    let rippleSetting = {
        speed: 4,
        maxSize: null,
        rippleDark: [0, 0, 0],
        rippleLight: [255, 255, 255]
    };
    let isStart = false;
    const PI2 = Math.PI * 2;
    const parentMap = new Map();
    const setStyle = (canvas, styleObj) => {
        Object.keys(styleObj).forEach(styleName => {
            canvas.style[styleName] = styleObj[styleName];
        });
    };
    const pushPoint = (rippleData, x, y) => {
        rippleData.pointList.push({ x, y, size: 0 });
    };
    const animation = () => {
        if (!isStart) {
            return;
        }
        requestAnimationFrame(animation);
        parentMap.forEach(rippleData => {
            const ctx = rippleData.canvas.getContext('2d');
            const maxSize = rippleSetting.maxSize || Math.sqrt(Math.pow(rippleData.size.width, 2) + Math.pow(rippleData.size.height, 2));
            const newPointList = [];
            const pos = rippleData.size.width * window.devicePixelRatio * 3;
            ctx.clearRect(0, 0, rippleData.size.width * window.devicePixelRatio, rippleData.size.height * window.devicePixelRatio);
            // rippleData.event.resize();
            rippleData.pointList.forEach((pointData) => {
                const lineWidth = (10 + pointData.size / 100) * window.devicePixelRatio;
                ctx.beginPath();
                ctx.fillStyle = 'black';
                ctx.arc(-pos, pointData.y * window.devicePixelRatio, pointData.size * window.devicePixelRatio, 0, PI2);
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
        });
    };
    ripple.appendTo = (parent) => {
        if (!parentMap.has(parent)) {
            if (window.getComputedStyle(parent).position === 'static') {
                console.warn('parent\'s position can not be static', parent);
            }
            const rect = parent.getBoundingClientRect();
            const canvas = document.createElement('canvas');
            const size = {
                width: rect.width,
                height: rect.height
            };
            canvas.width = size.width * window.devicePixelRatio;
            canvas.height = size.height * window.devicePixelRatio;
            const rippleData = {
                parent,
                canvas,
                pointList: [],
                size,
                event: {
                    resize: () => {
                        const eventRect = parent.getBoundingClientRect();
                        const size = {
                            width: eventRect.width,
                            height: eventRect.height
                        };
                        canvas.width = size.width * window.devicePixelRatio;
                        canvas.height = size.height * window.devicePixelRatio;
                        rippleData.size = size;
                    },
                    mousedown: (event) => {
                        pushPoint(rippleData, event.offsetX, event.offsetY);
                    },
                    touchstart: (event) => {
                        const eventRect = parent.getBoundingClientRect();
                        let x = event.targetTouches[0].pageX - eventRect.left;
                        let y = event.targetTouches[0].pageY - eventRect.top;
                        pushPoint(rippleData, x, y);
                    }
                }
            };
            setStyle(canvas, {
                width: '100%',
                height: '100%',
                zIndex: '99',
                pointerEvents: 'none',
                position: 'absolute'
            });
            parent.addEventListener('mousedown', rippleData.event.mousedown);
            parent.addEventListener('touchstart', rippleData.event.touchstart);
            parentMap.set(parent, rippleData);
            parent.appendChild(canvas);
        }
        else {
            throw 'this parent has ripple';
        }
    };
    ripple.removeFrom = (parent) => {
        if (!parentMap.has(parent)) {
            const rippleData = parentMap.get(parent);
            parent.removeChild(rippleData.canvas);
            parent.removeEventListener('mousedown', rippleData.event.mousedown);
            parent.removeEventListener('touchstart', rippleData.event.touchstart);
            parentMap.delete(parent);
        }
    };
    ripple.getRipple = (parent) => {
        return parentMap.has(parent) || null;
    };
    ripple.setting = (newSetting) => {
        Object.keys(newSetting).forEach(key => {
            rippleSetting[key] = newSetting[key];
        });
    };
    ripple.init = (newSetting) => {
        if (newSetting) {
            ripple.setting(newSetting);
        }
        ripple.start();
    };
    ripple.destroy = () => {
        isStart = false;
        parentMap.forEach(rippleData => {
            ripple.removeFrom(rippleData.parent);
        });
    };
    ripple.stop = () => {
        isStart = false;
    };
    ripple.start = () => {
        if (!isStart) {
            isStart = true;
            animation();
        }
    };
    ripple.resize = () => {
        parentMap.forEach(rippleData => {
            rippleData.event.resize();
        });
    };
})(window['ripple'] || (window['ripple'] = {}));

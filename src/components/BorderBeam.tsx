import { useEffect, useRef } from 'react';
import styles from './BorderBeam.module.css';

type ResizeSubscription = {
    observe: (target: HTMLDivElement) => void;
    disconnect: () => void;
};

export type BorderBeamProps = {
    color?: string;
    size?: number;
    duration?: number;
    borderRadius?: number;
    className?: string;
};

function resolveThemeColor(): { r: number; g: number; b: number } {
    const tempEl = document.createElement('div');
    tempEl.style.color = 'var(--rp-c-brand)';
    tempEl.style.display = 'none';
    document.body.appendChild(tempEl);
    const computed = getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);
    const match = computed.match(/(\d+)/g);
    if (match && match.length >= 3) {
        return {r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2])};
    }
    return {r: 255, g: 53, b: 26};
}

export function BorderBeam({
                               color,
                               size = 3,
                               duration = 4,
                               borderRadius = 24,
                               className,
                           }: BorderBeamProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) {
            return;
        }
        const context = canvas.getContext('2d', {alpha: true});
        if (!context) {
            return;
        }

        let colorRGB: string;
        if (color) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 1;
            tempCanvas.height = 1;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                tempCtx.fillStyle = color;
                tempCtx.fillRect(0, 0, 1, 1);
                const data = tempCtx.getImageData(0, 0, 1, 1).data;
                colorRGB = `${data[0]}, ${data[1]}, ${data[2]}`;
            } else {
                colorRGB = '255, 53, 26';
            }
        } else {
            const rgb = resolveThemeColor();
            colorRGB = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
        }

        let canvasWidth = 0;
        let canvasHeight = 0;

        const updateCanvasSize = () => {
            const nextCanvas = canvasRef.current;
            const nextContainer = containerRef.current;
            if (!nextCanvas || !nextContainer) {
                return;
            }
            const {width, height} = nextContainer.getBoundingClientRect();
            if (width === 0 || height === 0) {
                canvasWidth = 0;
                canvasHeight = 0;
                nextCanvas.width = 0;
                nextCanvas.height = 0;
                return;
            }
            canvasWidth = Math.round(width);
            canvasHeight = Math.round(height);
            const devicePixelRatio = window.devicePixelRatio || 1;
            nextCanvas.width = Math.max(1, Math.round(canvasWidth * devicePixelRatio));
            nextCanvas.height = Math.max(1, Math.round(canvasHeight * devicePixelRatio));
            context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
            context.lineCap = 'round';
        };

        const resizeSubscription: ResizeSubscription =
            typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(updateCanvasSize)
                : {
                    observe: (_target: HTMLDivElement) => {
                        window.addEventListener('resize', updateCanvasSize);
                    },
                    disconnect: () => {
                        window.removeEventListener('resize', updateCanvasSize);
                    },
                };

        resizeSubscription.observe(container);
        updateCanvasSize();

        let animationFrameId = 0;
        const startTime = performance.now();

        const getRoundedRectPerimeter = (width: number, height: number, r: number) => {
            if (r <= 0 || width < 2 * r || height < 2 * r) {
                return 2 * (width + height);
            }
            return 2 * (width - 2 * r) + 2 * (height - 2 * r) + 2 * Math.PI * r;
        };

        const getCoordinatesFromDistance = (distance: number) => {
            const width = canvasWidth;
            const height = canvasHeight;
            const r = borderRadius;

            if (r <= 0 || width < 2 * r || height < 2 * r) {
                const perimeter = 2 * (width + height);
                const normalizedDistance = distance % perimeter;
                if (normalizedDistance < width) {
                    return {x: normalizedDistance, y: 0};
                }
                if (normalizedDistance < width + height) {
                    return {x: width, y: normalizedDistance - width};
                }
                if (normalizedDistance < 2 * width + height) {
                    return {
                        x: width - (normalizedDistance - (width + height)),
                        y: height,
                    };
                }
                return {
                    x: 0,
                    y: height - (normalizedDistance - (2 * width + height)),
                };
            }

            const perimeter = getRoundedRectPerimeter(width, height, r);
            const normalizedDistance = distance % perimeter;
            let d = normalizedDistance;

            const straightTopBottom = width - 2 * r;
            const straightLeftRight = height - 2 * r;
            const quarterArc = (Math.PI * r) / 2;

            if (d < straightTopBottom) {
                return {x: r + d, y: 0};
            }
            d -= straightTopBottom;

            if (d < quarterArc) {
                const angle = -Math.PI / 2 + d / r;
                return {
                    x: width - r + r * Math.cos(angle),
                    y: r + r * Math.sin(angle),
                };
            }
            d -= quarterArc;

            if (d < straightLeftRight) {
                return {x: width, y: r + d};
            }
            d -= straightLeftRight;

            if (d < quarterArc) {
                const angle = d / r;
                return {
                    x: width - r + r * Math.cos(angle),
                    y: height - r + r * Math.sin(angle),
                };
            }
            d -= quarterArc;

            if (d < straightTopBottom) {
                return {x: width - r - d, y: height};
            }
            d -= straightTopBottom;

            if (d < quarterArc) {
                const angle = Math.PI / 2 + d / r;
                return {
                    x: r + r * Math.cos(angle),
                    y: height - r + r * Math.sin(angle),
                };
            }
            d -= quarterArc;

            if (d < straightLeftRight) {
                return {x: 0, y: height - r - d};
            }
            d -= straightLeftRight;

            {
                const angle = Math.PI + d / r;
                return {
                    x: r + r * Math.cos(angle),
                    y: r + r * Math.sin(angle),
                };
            }
        };

        const createBeamGradient = (start: number, end: number) => {
            const startCoord = getCoordinatesFromDistance(start);
            const endCoord = getCoordinatesFromDistance(end);
            const gradient = context.createLinearGradient(
                startCoord.x,
                startCoord.y,
                endCoord.x,
                endCoord.y,
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.2, `rgba(${colorRGB}, 0.3)`);
            gradient.addColorStop(0.5, `rgba(${colorRGB}, 1)`);
            gradient.addColorStop(0.8, `rgba(${colorRGB}, 1)`);
            gradient.addColorStop(0.9, `rgba(${colorRGB}, 0.8)`);
            gradient.addColorStop(1, 'transparent');
            return gradient;
        };

        const drawPathSegment = (start: number, end: number) => {
            let current = start;
            const currentPoint = getCoordinatesFromDistance(current);
            context.moveTo(currentPoint.x, currentPoint.y);
            const step = 1;
            while (current < end) {
                current += step;
                const point = getCoordinatesFromDistance(current);
                context.lineTo(point.x, point.y);
            }
        };

        const drawPath = (start: number, end: number) => {
            const perimeter = getRoundedRectPerimeter(canvasWidth, canvasHeight, borderRadius);
            if (end < start) {
                drawPathSegment(start, perimeter);
                drawPathSegment(0, end);
                return;
            }
            drawPathSegment(start, end);
        };

        const drawBeam = (progress: number) => {
            const width = canvasWidth;
            const height = canvasHeight;
            if (width === 0 || height === 0) {
                return;
            }
            const perimeter = getRoundedRectPerimeter(width, height, borderRadius);
            const beamLength = perimeter * 0.05;
            const positionStart = progress * perimeter;
            const positionEnd = (positionStart + beamLength) % perimeter;
            context.strokeStyle = createBeamGradient(positionStart, positionEnd);
            context.lineWidth = size;
            context.beginPath();
            drawPath(positionStart, positionEnd);
            context.stroke();
        };

        const animate = (currentTime: number) => {
            const elapsed = (currentTime - startTime) / 1000;
            const progress = (elapsed % duration) / duration;
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            drawBeam(progress);
            animationFrameId = window.requestAnimationFrame(animate);
        };

        animationFrameId = window.requestAnimationFrame(animate);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            resizeSubscription.disconnect();
        };
    }, [color, duration, size, borderRadius]);

    return (
        <div
            ref={containerRef}
            className={className ? `${styles.frame} ${className}` : styles.frame}
        >
            <canvas ref={canvasRef} className={styles.canvas}/>
        </div>
    );
}

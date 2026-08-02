import { useEffect, useRef } from 'react';

/**
 * Курсор в стиле референса: маленькая точка, которая следует за мышью точно,
 * и кольцо вокруг неё, догоняющее с задержкой (инерция).
 *
 * Позиции пишем прямо в style.transform из rAF-цикла — без state и re-render'ов.
 * Нативный курсор прячем только пока смонтирован компонент.
 */
export default function CustomCursor() {
    const dot = useRef<HTMLDivElement>(null);
    const ring = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const ringPos = { x: target.x, y: target.y };
        let raf = 0;
        let visible = false;

        const onMove = (e: MouseEvent) => {
            target.x = e.clientX;
            target.y = e.clientY;
            if (!visible) {
                visible = true;
                if (dot.current) dot.current.style.opacity = '1';
                if (ring.current) ring.current.style.opacity = '1';
            }
        };
        const onLeave = () => {
            visible = false;
            if (dot.current) dot.current.style.opacity = '0';
            if (ring.current) ring.current.style.opacity = '0';
        };

        const loop = () => {
            // кольцо догоняет курсор с задержкой => заметный «шлейф» при движении
            ringPos.x += (target.x - ringPos.x) * 0.13;
            ringPos.y += (target.y - ringPos.y) * 0.13;

            if (dot.current) dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
            if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;

            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);

        window.addEventListener('mousemove', onMove);
        document.addEventListener('mouseleave', onLeave);
        // прячем системный курсор, пока страница смонтирована
        const prevCursor = document.body.style.cursor;
        document.body.style.cursor = 'none';

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseleave', onLeave);
            document.body.style.cursor = prevCursor;
        };
    }, []);

    return (
        <>
            {/* Точка — строго под курсором */}
            <div
                ref={dot}
                className="fixed top-0 left-0 z-[200] pointer-events-none rounded-full bg-white opacity-0"
                style={{ width: 6, height: 6, transition: 'opacity 200ms' }}
            />
            {/* Кольцо — догоняет с инерцией */}
            <div
                ref={ring}
                className="fixed top-0 left-0 z-[200] pointer-events-none rounded-full opacity-0"
                style={{
                    width: 42,
                    height: 42,
                    border: '1px solid rgba(255,255,255,0.55)',
                    transition: 'opacity 200ms, width 200ms, height 200ms',
                }}
            />
        </>
    );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface DropdownMenuProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLElement>;
    children: React.ReactNode;
}

export default function DropdownMenu({ isOpen, onClose, triggerRef, children }: DropdownMenuProps) {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            // Default position: bottom-right aligned
            setPosition({
                top: rect.bottom + scrollY + 5,
                left: rect.right + scrollX, // Will adjust in CSS to align right edge
            });
        }
    }, [isOpen, triggerRef]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', onClose, { capture: true }); // Close on scroll to avoid detachment
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', onClose, { capture: true });
        };
    }, [isOpen, onClose, triggerRef]);

    if (!isOpen) return null;

    return createPortal(
        <div
            ref={menuRef}
            style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                transform: 'translateX(-100%)', // Align right edge with trigger right edge
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0',
                minWidth: '150px',
                zIndex: 9999,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
        >
            {children}
        </div>,
        document.body
    );
}

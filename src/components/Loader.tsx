// components/Loader.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {useTranslations} from "next-intl";

const Loader = () => {
    const [mounted, setMounted] = useState(false);
    const t = useTranslations('Loader');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-[#7e7e7e75] backdrop-blur-[2px] z-50 flex  items-center justify-center bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] transition-colors duration-300">
            <div className="relative blur-0  w-24 h-24">
                <div className="absolute inset-0 rounded-full border-8 border-t-gray-300 border-b-transparent animate-spin"></div>
                <div className="absolute inset-4 rounded-full bg-[var(--background)] flex items-center justify-center ">
                    <span className="text-white text-[10px] text-nowrap font-semibold text-sm tracking-wider">{t('loading')}...</span>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Loader;

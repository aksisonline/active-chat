"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function LogoButton() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <Link href="/" >
            <div className="absolute top-0 left-0 p-5" >
                <Image 
                    src={theme === 'dark' ? "/ac_logo_dark.svg" : "/ac_logo_light.svg"} 
                    alt="Logo" 
                    width={40}
                    height={40}
                />
            </div>
        </Link>
    );
}
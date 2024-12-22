"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function LogoButton() {
    const { theme } = useTheme();

    return (
        <Link href="/">
            <div className="absolute top-0 left-0 p-5">
                <Image 
                    src="/ac_logo.svg" 
                    alt="Logo" 
                    width={40}
                    height={40}
                    style={{
                        filter: theme === 'dark' ? 'invert(100%)' : 'invert(0%)'
                    }}
                />
            </div>
        </Link>
    );
}

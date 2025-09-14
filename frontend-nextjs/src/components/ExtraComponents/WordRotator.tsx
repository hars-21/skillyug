'use client'

import React, { useState, useEffect } from 'react';

interface WordRotatorProps {
  words: string[];
}

const WordRotator = ({ words }: WordRotatorProps) => {
    const [index, setIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const holdTimeout = setTimeout(() => {
            setIsAnimating(true);

            const animateTimeout = setTimeout(() => {
                setIsAnimating(false);
                setIndex((prevIndex) => (prevIndex + 1) % words.length);
            }, 1000); // 1s slide

            return () => clearTimeout(animateTimeout);
        }, 2000); // 3s hold

        return () => clearTimeout(holdTimeout);
    }, [index, words.length]);

    const styles = {
        transition: isAnimating ? 'transform 1s ease' : 'none',
        transform: isAnimating ? 'translateY(-100%)' : 'translateY(0)',
    };

    return (
        <div
            style={{
                display: 'inline-block',
                height: '2.5em',
                overflow: 'hidden',
                verticalAlign: 'middle',
                fontSize: "60px",
                color: "#F26F29",
                paddingTop: "2.5rem"
            }}
        >
            <div style={styles}>
                <span
                    style={{
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                    }}
                >
                    {words[index]}
                </span>
            </div>
        </div>
    );
};

export default WordRotator;

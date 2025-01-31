'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './VideoTutorials.module.css'

const VideoTutorials = () => {
    const [activeVideo, setActiveVideo] = useState<string>('pTFZFxd4hOI') // First video ID as default
    const videoRef = useRef<HTMLDivElement>(null)

    const tutorials = [
        {
            id: '1',
            title: 'Getting Started with Docker',
            videoId: 'pTFZFxd4hOI'
        },
        {
            id: '2',
            title: 'Docker Compose Tutorial',
            videoId: 'HG6yIjZapSA'
        },
        {
            id: '3',
            title: 'Docker Security Best Practices',
            videoId: 'KINjI1tlo2w'
        },
        {
            id: '4',
            title: 'Docker Networking Guide',
            videoId: 'bKFMS5C4CG0'
        },
        {
            id: '5',
            title: 'Docker Volume Management',
            videoId: 'G-s3i5n0BwY'
        },
        {
            id: '6',
            title: 'Docker Image Optimization',
            videoId: 'prlixoDIfrc'
        },
        {
            id: '7',
            title: 'Docker Deployment Strategies',
            videoId: 'Qw9zlE3t8Ko'
        },
        {
            id: '8',
            title: 'Troubleshooting Docker Issues',
            videoId: 'nWBtU2EF7QA'
        }
    ]

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const iframe = entry.target.querySelector('iframe')
                    if (!iframe) return

                    if (entry.isIntersecting) {
                        // Start playing when visible
                        const baseUrl = `https://www.youtube.com/embed/${activeVideo}?rel=0&mute=1`
                        iframe.src = `${baseUrl}&autoplay=1`
                    } else {
                        // Stop playing when not visible
                        const baseUrl = `https://www.youtube.com/embed/${activeVideo}?rel=0&mute=1`
                        iframe.src = baseUrl
                    }
                })
            },
            {
                threshold: 0.2  // Trigger earlier for smoother transition
            }
        )

        // Store the current value of the ref in a variable
        const currentRef = videoRef.current

        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            // Use the stored value in cleanup
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, [activeVideo]) // Added activeVideo to dependencies

    return (
        <div className={styles.container}>
            <div className={styles.linkRow}>
                {tutorials.slice(0, 4).map(tutorial => (
                    <button
                        key={tutorial.id}
                        className={`${styles.videoLink} ${activeVideo === tutorial.videoId ? styles.activeLink : ''}`}
                        onClick={() => setActiveVideo(tutorial.videoId)}
                    >
                        {tutorial.title}
                    </button>
                ))}
            </div>

            <div className={styles.videoWrapper} ref={videoRef}>
                <iframe
                    width="100%"
                    height="500"
                    src={`https://www.youtube.com/embed/${activeVideo}?rel=0&mute=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>

            <div className={styles.linkRow}>
                {tutorials.slice(4).map(tutorial => (
                    <button
                        key={tutorial.id}
                        className={`${styles.videoLink} ${activeVideo === tutorial.videoId ? styles.activeLink : ''}`}
                        onClick={() => setActiveVideo(tutorial.videoId)}
                    >
                        {tutorial.title}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default VideoTutorials 
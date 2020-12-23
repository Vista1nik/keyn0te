import React, {useState, useEffect} from 'react'
import { useRouter } from 'next/router';
import Head from 'next/head'

import '../styles/globals.css'

import Loading from '../components/ui/loading'

function MyApp({ Component, pageProps }) {
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        if (!socket || socket === 'placeholder') {
            const ws = new WebSocket(`ws://${window.location.host}`);

            ws.addEventListener('open', e => {
                setSocket(ws)
            })
    
            ws.addEventListener('close', e => {
                // Set socket to placeholder to avoid erasing keynote state
                setSocket('placeholder')
            })
        }
    }, [socket])

    return (
        <div>
            <Head>
                <title>keyn0te</title>
                <meta name="mobile-web-app-capable" content="yes"></meta>
                <meta name="apple-mobile-web-app-capable" content="yes"></meta>
                <link rel="manifest" href="manifest.json" />

                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="application-name" content="Remote" />
                <meta name="apple-mobile-web-app-title" content="Remote" />
                <meta name="theme-color" content="#000000" />
                <meta name="msapplication-navbutton-color" content="#000000" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="msapplication-starturl" content="/r" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

                <link rel="icon" sizes="512x512" href="icon.png" />
                <link rel="apple-touch-icon" sizes="512x512" href="icon.png" />
            </Head>
            {socket ?
                <Component socket={socket} {...pageProps} />
            :
            <div className="loading">
                <Loading />
            </div>
            }
        </div>
    )
}

export default MyApp

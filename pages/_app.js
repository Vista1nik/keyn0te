import React, {useState, useEffect} from 'react'
import { useRouter } from 'next/router';
import Head from 'next/head'

import '../styles/globals.css'

import Loading from '../components/ui/loading'

function MyApp({ Component, pageProps }) {
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        const ws = new WebSocket(`ws://${window.location.host}`);

        ws.addEventListener('open', e => {
            setSocket(ws)
        })
    }, [])

    return (
        <div>
            <Head>
                <title>keyn0te</title>
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

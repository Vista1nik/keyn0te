import React, {useState, useEffect, useRef} from 'react'
import useQuery from '../lib/useQuery'

import dynamic from 'next/dynamic';

import Loading from '../components/ui/loading'
import LightBox from '../components/ui/lightbox'
import Key from '../components/ui/key'

import QRCode from 'react-qr-code'

const PdfViewer = dynamic(
  () => import('../components/pdfViewer'),
  { ssr: false }
);

const Keynote = props => {
    const query = useQuery();

    const [keynote, setKeynote] = useState(null)
    const [slide, setSlide] = useState(1)
    const [loading, setLoading] = useState(true)
    const [remoteLightbox, setRemoteLightbox] = useState(true)
    const [url, setURL] = useState(null)
    const [renew, setRenew] = useState(false)

    const lightboxRef = useRef(null)
    const keynoteRef = useRef(null)

    // Focus to LightBox
    useEffect(() => {
        if (!loading && lightboxRef.current) {
            lightboxRef.current.focus()
        }
    }, [loading, remoteLightbox])

    // Focus to keynote viewer
    useEffect(() => {
        if (!remoteLightbox) {
            keynoteRef.current.focus()
        }
    }, [remoteLightbox])

    const nextSlide = () => {
        if (slide + 1 <= keynote.totalSlides) {
            setSlide(slide + 1)
        } else {
            setSlide(1)
        }
    }

    const backSlide = () => {
        if (slide - 1 != 0) {
            setSlide(slide - 1)
        } else {
            setSlide(keynote.totalSlides)
        }
    }

    useEffect(() => {
        if (query) {
            setURL(window.location.host)
            props.socket.send(JSON.stringify({
                type: "keynoteInit",
                keynote: query.f
            }))

            const handler =  e => {
                let data = JSON.parse(e.data)

                if (data.type == 'keynoteInit') {
                    setKeynote({
                        id: data.id,
                        file: data.file,
                        totalSlides: data.totalSlides
                    })
                }
            }

            props.socket.addEventListener('message', handler)
            return () => {
                props.socket.removeEventListener('message', handler)
            }
        }
    }, [query])

    // Remote handler
    useEffect(() => {
        const handler = e => {
            let data = JSON.parse(e.data)

            if (data.type == 'keynoteControl') {
                // Actions from remote control
                switch(data.action) {
                    case 'ping': {
                        setRemoteLightbox(false)
                        break;
                    }
                    case 'nextSlide': {
                        nextSlide()
                        break;
                    }
                    case 'backSlide': {
                        backSlide()
                        break;
                    }
                }
            }
        }
        props.socket.addEventListener('message', handler)
        setRenew(false)
        return () => {
            props.socket.removeEventListener('message', handler)
        }
    }, [slide, keynote, renew])

    useEffect(() => {
        if (keynote && props.socket !== 'placeholder') {
                props.socket.send(JSON.stringify({
                    type: "keynoteRenew",
                    keynote: query.f,
                    id: keynote.id
                }))
                setRenew(true)
        }
    }, [props.socket])

    return (
        <div className="container">
            <style jsx>{`
                .container {
                    user-select: none;
                }

                .lightbox-code-container {
                    display: flex;
                    justify-content: center;
                    margin 3em 0;
                }
                .lightbox-code {
                    font-size: 3em;
                    margin: 0 12px;
                }

                .lightbox-code-divider {
                    color: #333;
                    font-size: 3em;
                    margin: 0;
                }

                .lightbox-text {
                    color: #666;
                }

                .divider {
                    display: flex;
                    align-items: center;
                }

                .divider > p {
                    color: #333;
                    margin: 0 8px;
                }

                .lightbox-qrcode {
                    margin: 1em 0;
                }
            `}</style>
            <div className="viewer">
                {loading &&
                    <div className="loading">
                                <Loading />
                    </div>
                }
                {!loading && remoteLightbox &&
                    <LightBox>
                        <div tabIndex={-1} onBlur={() => {
                            lightboxRef.current.focus()
                        }} ref={lightboxRef} onKeyDown={e => {
                            if (e.code === "Enter" || e.code === "Escape" || e.code === "Space") {
                                setRemoteLightbox(false)
                            }
                        }} align="center">
                            <div className="lightbox-code-container">
                                <h1 className="lightbox-code">{keynote.id.split('-')[0]}</h1>
                                <h1 className="lightbox-code-divider">-</h1>
                                <h1 className="lightbox-code">{keynote.id.split('-')[1]}</h1>
                            </div>
                            <p className="lightbox-text">Введите код на <a href={`http://${url}/r?c=${keynote.id}`}>{url}/r</a></p>
                            <div className="divider">
                                <hr />
                                <p>или</p>
                                <hr />
                            </div>
                            <div className="lightbox-qrcode">
                                <QRCode bgColor="#000000" fgColor="#FFFFFF" value={`http://${url}/r?c=${keynote.id}`} />
                            </div>
                            <div className="divider">
                                <hr />
                                <p>или</p>
                                <hr />
                            </div>
                            <p className="lightbox-text" style={{marginBottom: 0}}>Нажмите <Key>Enter ⏎</Key> чтобы продолжить</p>
                        </div>
                    </LightBox>
                }
                {keynote &&
                    <div 
                        ref={keynoteRef} 
                        onKeyDown={e => {
                            if (e.code === "Enter"  || e.code === "Space" || e.code === "ArrowRight") {
                                nextSlide()
                            } else if (e.code === "Backspace" || e.code === "ArrowLeft") {
                                backSlide()
                            } else if (e.code === "Escape") {
                                setRemoteLightbox(true)
                            }
                        }} 
                        onClick={() => {
                            if (slide + 1 <= keynote.totalSlides) {
                                setSlide(slide + 1)
                            } else {
                                setSlide(1)
                            }
                        }}
                        tabIndex={-1}
                    >
                        <PdfViewer onLoad={() => {
                            setLoading(false)
                        }} url={keynote.file} width={1920} pageNumber={slide} />
                    </div>
                }
            </div>
        </div>
    )
}

export default Keynote
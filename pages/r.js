import React, {useState, useEffect, useRef} from 'react'
import Key from '../components/ui/key';
import useQuery from '../lib/useQuery'

import { useSwipeable } from 'react-swipeable'

const Remote = props => {
    const query = useQuery();

    const [keynoteID, setKeynoteID] = useState(null)

    const codePart1 = useRef(null)
    const codePart2 = useRef(null)
    
    // Set keynote id from query
    useEffect(() => {
        if (query) {
            setKeynoteID(query.c)

            props.socket.addEventListener('message', e => {
                let data = JSON.parse(e.data)

                if (data.type === 'notfound') {
                    setKeynoteID(null)
                    alert('keynote not found')
                }
            })
        }
    }, [query])

    // Test connection
    useEffect(() => {
        if (keynoteID) {
            props.socket.send(JSON.stringify({
                type: 'keynoteControl',
                id: keynoteID,
                action: 'ping',
                payload: ''
            }))
        } else {
            codePart1.current.focus()
        }
    }, [keynoteID])

    const handlers = useSwipeable({
        onSwipedLeft: e => {
            props.socket.send(JSON.stringify({
                type: 'keynoteControl',
                id: keynoteID,
                action: 'backSlide',
                payload: ''
            }))
        },
        trackMouse: true,
        trackTouch: true,
        preventDefaultTouchmoveEvent: true
    })
    

    return (
        <div className="container">
            <style jsx>{`
                .container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    width: 100vw;
                }

                .code {
                    display: flex;
                    align-items: center;
                    width: fit-content;
                }

                .code-input {
                    font-size: 3em;
                    font-weight: bold;
                    width: 3ch;
                    box-sizing: content-box;
                    margin: 0 16px;
                }

                .code-divider {
                    color: #333;
                    font-size: 3em;
                }

                .code-description {
                    color: #666;
                    width: 23vw;
                }

                .touch {
                    transition: 0.25s ease-in-out;
                    user-drag: none; 
                }

                .touch:hover {
                    transform: scale(1.2)
                }

                .touch:active {
                    transform: scale(0.8)
                }
            `}</style>
            {keynoteID ? 
                <div>
                    <img 
                        className="touch" 
                        src="/static/touch.svg"
                        onClick={() => {
                            props.socket.send(JSON.stringify({
                                type: 'keynoteControl',
                                id: keynoteID,
                                action: 'nextSlide',
                                payload: ''
                            }))
                        }}
                        {...handlers}
                    />
                </div>
            :
                <div align="center">
                    <div className="code">
                        <input 
                            ref={codePart1} 
                            placeholder="000" 
                            pattern="[0-9]*" 
                            maxLength="3" 
                            className="code-input" 
                            inputMode="numeric" 
                            type="number"
                            onChange={e => {
                                if (e.currentTarget.value.length >= 3) {
                                    e.preventDefault()
                                    codePart2.current.focus()
                                } 
                            }}
                        />
                        <h1 className="code-divider">-</h1>
                        <input 
                            ref={codePart2} 
                            placeholder="000" 
                            pattern="[0-9]*" 
                            maxLength="3" 
                            className="code-input" 
                            inputMode="numeric" 
                            type="number"
                            onChange={e => {
                                if (e.currentTarget.value.length > 2) {
                                    e.preventDefault()
                                    e.currentTarget.value = e.currentTarget.value.slice(0, 3)

                                    setKeynoteID(codePart1.current.value + '-' + e.currentTarget.value.slice(0, 3))
                                }
                                if (e.currentTarget.value.length === 0) {
                                    e.preventDefault()
                                    codePart1.current.focus()
                                } 
                            }}
                            onKeyDown={e => {
                                if (e.code === "Backspace" && e.currentTarget.value.length === 0) {
                                    codePart1.current.focus()
                                }
                            }}
                        />
                    </div>
                    <p className="code-description">Введите код с экрана презентации. Если код не показан, вызовите окно с кодом нажав на <Key>ESC</Key></p>
                </div>
            }
        </div>
    )
}

export default Remote
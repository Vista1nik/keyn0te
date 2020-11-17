import React, {useState, useEffect} from 'react'

import File from '../components/ui/file'
import Loading from '../components/ui/loading'

const Index = props => {

    const [keynotes, setKeynotes] = useState([])

    useEffect(() => {
        props.socket.send(JSON.stringify({
            type: "keynotes"
        }))

        props.socket.addEventListener('message', e => {
            let data = JSON.parse(e.data)

            console.log(data)

            if (data.type == 'keynotes') {
                setKeynotes(data.keynotes)
            }
        })
    }, [])

    return (
        <div className="container">
            <style jsx>{`
                .container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }

                .finder {
                    width: 50vh;
                }
            `}</style>
            <div className="finder">
                {keynotes.length === 0 ? 
                    <div className="loading">
                                <Loading />
                    </div>
                :
                    keynotes.map((keynote, index) => (
                        <File file={keynote.name} alternate={index % 2}>{keynote.name.substr(0, keynote.name.lastIndexOf('.'))}</File>
                    ))
                }
            </div>
        </div>
    )
}

export default Index
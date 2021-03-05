import {FiFile} from 'react-icons/fi'

import Link from 'next/link'

const File = props => (
    <div>
        <style jsx>{`
            .file {
                background-color: ${props.alternate ? '#111': '#000'};
                display: flex;
                padding: 12px;
                margin: 4px 0;
                font-weight: 600;
                border-radius: 11px;
                align-items: center;
                user-select: none;
                transition: 0.1s ease;
            }

            .file-icon {
                margin-right: 8px;
                display: flex;
                align-items: center;
            }

            .file:hover {
                cursor: pointer;
                background-color: #222;
            }

            .file:active {
                background-color: #333;
            }

            .thumbnail {
                height: 64px;
                margin-right: 24px;
                border-radius: 11px;
            }
        `}</style>
        <Link href={`/k?f=${props.file}`}>
            <a draggable={false} className="file">
                <img 
                    className="thumbnail" 
                    src={`data:image/png;base64, ${props.thumbnail}`} 
                    draggable={false}
                />
                {props.children}
            </a>
        </Link>
    </div>
)

export default File
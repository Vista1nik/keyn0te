const Loading = props => (
    <div>
        <style jsx>{`

            .lds-ring div {
                display: inline-block;
                width: 2rem;
                height: 2rem;
                vertical-align: text-bottom;
                border: .25em solid;
                border-right: .25em solid transparent;
                border-radius: 50%;
                animation: lds-ring .75s infinite linear both;
            }
            
            @keyframes lds-ring {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
        `}</style>
        <div className="lds-ring"><div></div></div>
    </div>
)

export default Loading
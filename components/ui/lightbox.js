const LightBox = props => (
    <div className="lightbox-container">
        <style jsx>{`
            .lightbox-container {
                position: fixed;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 99;
                height: 100vh;
                width: 100vw;
                background-color: rgba(0,0,0,0.5)
            }

            .lightbox {
                width: 50vh;
                background-color: #000;
                border-radius: 11px;
                filter: drop-shadow(0px 0px 20px rgba(0, 0, 0, 0.15)), drop-shadow(0px 25px 30px rgba(0, 0, 0, 0.35));
                border: 0.5px solid rgba(0, 0, 0, 0.12);
                padding: 24px;
                animation: slidein 0.5s cubic-bezier(0, 0, 0.2, 1);
                border-top:
            }

            @keyframes slidein {
                from {
                    transform: translateY(100vh);
                }

                to {
                    transform: translateY(0vh);
                }
            }
        `}</style>
        <div className="lightbox">{props.children}</div>
    </div>
)

export default LightBox
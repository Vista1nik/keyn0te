const Key = props => (
    <div className='key'>
        <style jsx>{`
            .key {
                padding: 4px;
                border: 1px solid #333;
                font-size: .75em;
                border-radius: 8px;
                display: inline-block;
            }    
        `}</style>
        {props.children}
    </div>
)

export default Key
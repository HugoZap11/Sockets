(async function(){

    const socket = new WebSocket('ws://localhost:8080');

    socket.onmessage=(WebSocketMessage)=>{
        const messageBody = JSON.parse(WebSocketMessage.data);
        const cursor = getOrCreateCursorFor(messageBody);
        cursor.style.transform = 'transalate(${messageBody.x}px, ${messageBody.y}px)';
    };
    
    document.body.onmousemove=(event)=>{
        const messageBody = { x: event.clientX, y: event.clientY };
        socket.send(JSON.stringify(messageBody));
    };

async function connectToServer(){
    const socket = new WebSocket('ws://localhost:8080');
    return new Promise((resolve, reject)=>{
        const timer = setInterval(()=>{
            if(socket.readyState === WebSocket.OPEN){
                clearInterval(timer);
                resolve(socket);
            }
    },10);

    });
}

function getOrCreateCursorFor(messageBody){
    const sender = messageBody.sender;
    const existing = document.querySelector(`[data-sender="${sender}"]`);
    if(existing){
        return existing;
    }

    const template= document.getElementByIdI('cursor');
    const cursor = template.content.cloneNode(true).querySelector('.cursor');
    const svgPath =cursor.getElementsByTagName('path')[0];


    cursor.setAttribute('data-sender', sender);
    svgPath.setAttribute('fill',`hsl(${messageBody.color}, 50%, 50%`);
    document.body.appendChild(cursor);
    
    return cursor;
}

})();
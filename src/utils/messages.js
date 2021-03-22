const generateMessage = (message)=>{
    return {
        text: message,
        createdAt : new Date().getTime()
    }
}

const generateLocation = (username,url)=>{
    return {
        userName: username,
        location: url,
        createdAt: new Date().getTime()
    }
}

const generateClientMessage =(username,message)=> {
    return {
        text : message.text,
        createdAt: new Date().getTime(),
        userName: username
    }
}
module.exports ={
    generateMessage,
    generateLocation,
    generateClientMessage
}

const socket = io()
//Elements
const $chatForm = document.querySelector('form');
const $messageFormButton = $chatForm.querySelector("button")
const $messageFormInput = $chatForm.querySelector("input")
const $messages = document.querySelector("#messages")
//Templates
const $serverMessageTemplate = document.querySelector('#server-template').innerHTML
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate =document.querySelector('#sidebar-template').innerHTML
//Options
console.log(Qs.parse(location.search,{ignoreQueryPrefix: true}));
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}



socket.on('serverMessage', (msg)=>{
    const html = Mustache.render($serverMessageTemplate, {
        message: `${msg.text}`,
        createdAt : moment(msg.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend', html)
})
socket.on('message', (msg)=>{
    let user_name = msg.userName == username.trim().toLowerCase() ? 'You' : msg.userName
    const html = Mustache.render($messageTemplate, {
        message: msg.text,
        createdAt : moment(msg.createdAt).format("h:mm a"),
        userName: user_name

    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (location)=>{ 
   const html = Mustache.render($locationTemplate, {
       location: location.location,
       createdAt: moment(location.createdAt).format("h:mm a"),
       userName: location.userName
   });
   $messages.insertAdjacentHTML('beforeend', html)
})
//Templates

$chatForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    let message ={
        text:e.target.elements.message.value,
        username
    }

    socket.emit("sendMessage",message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ""
        $messageFormInput.focus()
        if(error){
            console.log(error);
        }
        console.log("Acknowldgement from server")
    });

})
const btnLocation = document.querySelector("#send-location")
btnLocation.addEventListener("click",(e)=>{
    if(!navigator.geolocation)
    {
            return  alert("no access")
    }
    e.target.setAttribute('disabled', 'disabled');
   navigator.geolocation.getCurrentPosition((position)=>{
       e.target.removeAttribute('disabled');
       const location = {
           longitude : position.coords.longitude,
           latitude: position.coords.latitude,
       }
       socket.emit("sendLocation", location, (msg)=>{
           console.log("Acknowldgement from server" , msg)
       })
   })
})
socket.emit('join', {username, room}, (error)=>{
    if(error)
        location.href = "/"
})

socket.on('roomData',({room, users})=>{
   console.log(room, users)
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML= html
}) 
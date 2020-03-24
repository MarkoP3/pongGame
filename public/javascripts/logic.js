const canvas=document.getElementById('pongTable');
const context=canvas.getContext('2d');
let socket=io.connect();

let gameInstance=null;
const game={
    width:(screen.width*0.8>=window.innerHeight?window.innerHeight/0.8:screen.width),
    height:(screen.width*0.8>=window.innerHeight?window.innerHeight:screen.width*0.8),
    fps:60,
    color:"black",
    playerHeightScale:0.4,
    playerWidthScale:0.06
};
const player1={
    x:0,
    y:game.height/2-game.height*game.playerHeightScale/2,
    height:game.height*game.playerHeightScale,
    width:game.width*game.playerWidthScale,
    color:"white",
    score:0
};
const player2= {
        x:game.width-game.width*game.playerWidthScale,
        y:game.height/2-game.height*game.playerHeightScale/2,
        height:game.height*game.playerHeightScale,
        width:game.width*game.playerWidthScale,
        color:"white",
        score:0,
    };
const ball= {
        x:game.width/2,
        y:game.height/2,
        color:"white",
        radius:game.width*game.playerWidthScale*game.playerHeightScale,
        speed:1,
        velocityX:1,
        velocityY:1
    };
const centerLine= {
        x:game.width/2,
        y:0,
        width:game.width*0.005,
        height:game.height*0.1,
        color:"white"
    };
function render() {
    drawBack();
    drawText(player1.score,game.width/4,game.height/5);
    drawText(player2.score,3*game.width/4,game.height/5);
    drawText(player2.score,3*game.width/4,game.height/5);
    drawCenterLine();
    drawRect(player1.x,player1.y,player1.width,player1.height,player1.color);
    drawRect(player2.x,player2.y,player2.width,player2.height,player2.color);
    drawBall(ball.x,ball.y,ball.radius,ball.color);

}
function drawText(text,x,y){
    context.fillStyle = "#FFF";
    context.font = "75px fantasy";
    context.fillText(text, x, y);
}
function drawCenterLine() {
    for(let i=0;i<=game.height;i+=centerLine.height*1.5)
    {
        drawRect(centerLine.x-centerLine.width/2,centerLine.y+i,centerLine.width,centerLine.height,centerLine.color);
    }
}
function drawBack() {
    canvas.height=game.height;
    canvas.width=game.width;
    context.fillStyle=game.color;
    context.fillRect(0,0,game.width,game.height);
}
function drawRect(x,y,w,h,color) {
   context.fillStyle=color;
   context.fillRect(x,y,w,h);
}
function drawBall(x,y,r,color) {
context.fillStyle=color;
context.beginPath();
context.arc(x,y,r,0,Math.PI*2,false);
context.closePath();
context.fill();
}
function resetBall() {
ball.x=game.width/2;
ball.y=game.height/2;
ball.speed=1;
ball.velocityX=-ball.velocityX;

}
function update() {
    if(ball.x+ball.radius>game.width)
    {
        player1.score++;
        resetBall();
        if(player1.score===11)
        {
            document.getElementById('winLoseLabel').innerText="You won!";
            document.getElementById('winLoseLabel').style.color="green";
            gameOver();
        }
    }
    else if(ball.x-ball.radius<0)
    {
        player2.score++;
        resetBall();

        if(player2.score==11)
        {

            document.getElementById('winLoseLabel').innerText="You lost!";
            document.getElementById('winLoseLabel').style.color="red";
            gameOver();
        }
    }
    ball.x+=ball.velocityX;
    ball.y+=ball.velocityY;
    if(ball.y+ball.radius>game.height || ball.y-ball.radius<0)
    {
        ball.velocityY=-ball.velocityY;
    }
    let player = (ball.x + ball.radius < game.width/2) ? player1 : player2;
    if(collision(ball,player))
    {
        let collisionPoint = (ball.y - (player.y + player.height/2));

        collisionPoint=collisionPoint/(player.height/2);
   let angle=(Math.PI/4)*collisionPoint;
   ball.velocitX=ball.speed*Math.cos(angle);
   ball.velocityY=ball.speed*Math.sin(angle);
    ball.velocityX=-ball.velocityX;
    ball.speed+=0.1;
    }

}
function collision(ball,player) {
    player.top = player.y;
    player.bottom = player.y + player.height;
    player.left = player.x;
    player.right = player.x + player.width;

    ball.top = ball.y - ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;
    ball.right = ball.x + ball.radius;

    return player.left < ball.right && player.top < ball.bottom && player.right > ball.left && player.bottom > ball.top;
}
function movePlayer(evt) {
    if(gameInstance!=null){
let bound=canvas.getBoundingClientRect();
player1.y=evt.clientY-bound.top-player1.height/2;
socket.emit('playerMoved',player1.y);}
}
function start()
{
    update();
    render();
}
function newGame()
{
   gameInstance=setInterval(start,game.fps/1000);
    document.getElementById('startMenu').style.display="none";
}
function requestGame() {
    socket.emit('startNewGame');
    document.getElementById('winLoseLabel').innerText="Searching for players...";
}
function gameOver() {
    player1.score=0;
    player2.score=0;
    ball.speed=1;
    clearInterval(gameInstance);
    gameInstance=null;
    document.getElementById('startMenu').style.display="block";
}
render();
socket.on('gameReady',function (direction) {
    ball.velocityX=direction*ball.velocityX;
    newGame();
});
socket.on('opponentMoved',function (position) {

   player2.y=position;
});


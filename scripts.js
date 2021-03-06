// Firebase -------------------------------------------------------------------------------------

var firebaseConfig = {
    apiKey: "AIzaSyAtJsf9OYIx3Ul9wRSWsxSRPrNa69Z4Rj0",
    authDomain: "cardsagainsthumanity-6a896.firebaseapp.com",
    databaseURL: "https://cardsagainsthumanity-6a896-default-rtdb.firebaseio.com",
    projectId: "cardsagainsthumanity-6a896",
    storageBucket: "cardsagainsthumanity-6a896.appspot.com",
    messagingSenderId: "391885717905",
    appId: "1:391885717905:web:7cb754567c6d69ffe99a30",
    measurementId: "G-NLE09XVV78"
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();

// Global Variables ------------------------------------------------------------------------------

let newgameid = "null";
let host = "null";
let username = null;
let latestinput = "null";
let overallcode = "null";
var black = [];
var white = [];
var packs = [];
let storedblack = null;
let totalwhite = 0;
let playerwhite = [];
let lastpicked = null;
let picked = null;
let confirmed = "false";
let userlist =[];
let czar = "0";
let czarname = null;
let alreadyconfirmed = "false";
let rounds = 0;
let winnercard = null;
let runpicked = "false";


// Functions -------------------------------------------------------------------------------------


function wait(ms){
  var start = new Date().getTime();
  var end = start;
  while(end < start + ms) {
    end = new Date().getTime();
 }
}


function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

window.onload = function(){
  let url = new URLSearchParams(location.search);
  let dacode = url.get('code');
  if(dacode !== null){
    joingame(dacode);
  }else{
  }
};


function joingame(code){
  let data = "null";
  var gamecodes = firebase.database().ref('Games/' + code + "/");
  gamecodes.once('value', (snapshot) =>{
    data = snapshot.val();
    if(data == 'null'){
      alert("Incorrect Code");
    }else{
      newinput("Enter Name", "create");
      newgameid = code;
    }
  });
};

function newgame(input){
  let string = makeid(5);
  newgameid = string;
  firebase.database().ref('Games/' + string).set({
  });
  host = "1";
  createplayer(input);
};

function createplayer(name){
  username = name;
  firebase.database().ref('Games/'+ newgameid + '/' + 'players/' + username).set({
    name: 'null'
  });
  document.getElementById("logo").style.marginLeft = "calc(50% - 350px)";  
  document.getElementById("GameInfo").innerText = newgameid;
  document.getElementById("url").innerText = "https://fillthegapz.com/?code=" + newgameid;
  document.getElementById("StartGame").style.display = "none";
  document.getElementById("JoinGame").style.display = "none";
  document.getElementById("Leave").style.display = "block";
  if(host !== "1"){
    var status67 = firebase.database().ref('Games/' + newgameid + "/" + 'host/');
    status67.on('value', (snapshot) =>{
      let value = JSON.stringify(snapshot.val());
      if(value == '{"status":"lost"}'){
        alert("Host Disconnected.");
        firebase.database().ref('Games/'+ newgameid).remove();
        location.reload();
      }
    });
    document.getElementById("options").style.display = "none";
    document.getElementById("pleasewait").style.display = "block";
    document.getElementById("waittext").innerText = "Please wait for the host to start the game.";
    const status = firebase.database().ref('Games/' + newgameid + '/status/');
    status.on('value', (snapshot) =>{
      let started = JSON.stringify(snapshot.val());
      if(started == '{"started":1}'){
        newround();
      }
    });
  }else{
    var disconnect = firebase.database().ref('Games/' + newgameid + '/host/status');
    disconnect.onDisconnect().set("lost");
    document.getElementById("options").style.display = "block";
    document.getElementById("pleasewait").style.display = "none";
    const cardlist = firebase.database().ref('Games/' + newgameid + "/" + "packs/" + "packs/");
    cardlist.on('value', (snapshot) =>{
      let data = (JSON.stringify(snapshot.val(), null, 3))
      var newdata1 = data.replace(/"/g,'');
      var newdata2 = newdata1.replace('[','');
      var newdata3 = newdata2.replace(/]/g,'');
      var packs = newdata3.split(',');
      document.getElementById("packlist").innerHTML = makeTableHTML(packs); 
    });
  }
  loadlist();
};

function startgame(){
  if(host == "1"){
    firebase.database().ref('Games/' + newgameid + '/' + 'status/').set({
      started: 1,
    });
    newround();
  }else{
    alert("You are not host.");
  }
};


function loadlist(){
  var playerlist = firebase.database().ref('Games/' + newgameid + "/" + 'players/');
  playerlist.on('value', (snapshot) =>{
    let data = (JSON.stringify(snapshot.val(), null, 3))
    var newdata1 = data.replace(/}/g,'');
    var newdata2 = newdata1.replace(/{/g,'');
    var newdata3 = newdata2.replace(/:/g,'');
    var newdata4 = newdata3.replace(/"/g,'');
    var newdata5 = newdata4.replace(/name/g,'');
    var newdata6 = newdata5.replace(/null/g,'');
    var newdata7 = newdata6.replace(/ /g , '');
    var newdata8 = newdata7.replace(/(\n)+/g , '');
    var users = newdata8.split(',');
    userlist = [];
    userlist.push(users);
    document.getElementById("PlayerList").innerHTML = makeTableHTML(users,"tablerow"); 
  });
}

function makeTableHTML(myArray,class1){
  var result = "<table border=0>";
  for(var i=0; i<myArray.length; i++) {
      result += "<tr>";
      for(var j=0; j<myArray[i].length; j++){
          result += "<td  class = '" + class1 + "'>"+myArray[i][j]+"</td>";
      }
      result += "</tr>";
  }
  result += "</table>";

  return result;
}

function newinput(title,code){
  document.getElementById("popuptitle").innerText = title;
  document.getElementById("inputmodal").style.display = "block";
  if(code == "join"){
    overallcode = "join";
  }if(code == "new"){
    overallcode = "startnew";
  }if(code == "create"){
    overallcode = "create";
  }

}

function submit(){
  let input = document.getElementById("input").value;
  if(input == null || input == ""){
    alert("Please Enter something");
  }else{
    if(overallcode == "join"){
      joingame(input);
      document.getElementById("inputmodal").style.display = "none";
    }if(overallcode == "startnew"){
      newgame(input);
      document.getElementById("inputmodal").style.display = "none";
    }if(overallcode == "create"){
      createplayer(input);
      document.getElementById("inputmodal").style.display = "none";
    }
  }
}

function add_deck(){
  let input = document.getElementById("cardcode").value;
  packs.push(input);
  firebase.database().ref('Games/'+ newgameid + '/packs').set({
    packs : packs,
  });
  fetch('https://castapi.clrtd.com/cc/decks/' + input + '/cards')
        .then((resp) => resp.json())
        .then(function (data) {
            black.push(data.calls);
            white.push(data.responses);
            firebase.database().ref('Games/' + newgameid + '/white').set({
              cards: JSON.stringify(white),
            });
        });
}


function getRandom(arr) {
  var random1 = Math.floor((Math.random() * (arr.length - 1)));
  let final =  arr[random1][Math.floor((Math.random() * (arr[random1].length)))].text;
  return final;
}


function getRandomwhite(arr) {
  var random1 = Math.floor((Math.random() * (arr.length - 1)));
  let final =  arr[random1][Math.floor((Math.random() * (arr[random1].length)))];
  return final;
}



function newround(){
  runpicked = "false";
  firebase.database().ref('Games/'+ newgameid + '/czarpick/').set({
    pick : "null",
  });
  alreadyconfirmed = "false";
  firebase.database().ref('Games/'+ newgameid + '/pickedwhite/').remove();
  let selectedwhitecards = [];
  let string3 = null;
  czar = "0";
  lastpicked = null;
  document.getElementById("confirmselection").style.display = "none";
  document.getElementById("whiteboxesparent").style.display = "block";
  document.getElementById("pickerselection").style.display = "none";
  firebase.database().ref('Games/'+ newgameid + '/playerstatus/').set({
    status : "0",
  });
  confirmed = "false";
  if(host == "1"){
    firebase.database().ref('Games/'+ newgameid + '/status/').set({
      started: 0
    });
    let new_black = getRandom(black);
    firebase.database().ref('Games/' + newgameid + '/card/').set({
      black: new_black
    });
    czarname = getRandomwhite(userlist);
    firebase.database().ref('Games/' + newgameid + '/czar/').set({
      czar: czarname,
    });
  }
  const retrieveczar = firebase.database().ref('Games/' + newgameid + '/czar/');
  retrieveczar.once('value', (snapshot) =>{
    let string1 = JSON.stringify(snapshot.val());
    let string2 = string1.replace('{"czar":"', '');
    string3 = string2.replace('"}','');
    if(string3 == username){
      czar = "1";
    }else{
      czar = "0";
    }
  getwhite();
  const status = firebase.database().ref('Games/' + newgameid + '/card').child('black');
  status.once('value', (snapshot) =>{
    storedblack = JSON.stringify(snapshot.val());
    var newdata = storedblack.replace("[", "");
    var newdata1 = newdata.replace(/\",\"/g , "   ﹏﹏﹏﹏   " );
    var newdata2 = newdata1.replace(/\n/g,' ');
    var newdata3 = newdata2.replace(/"/g ,'');
    var newdata4 = newdata3.replace("]", "");
    document.getElementById("blackcontent").innerHTML = newdata4;
  });
  
  if(czar == "1"){
    selectionconfirmed();
    document.getElementById("whiteboxes").style.display = "none";
    document.getElementById("czarnotif").style.display = "block";
    document.getElementById("confirmselection").style.display = "none";
  }else{
    document.getElementById("whiteboxes").style.display = "block";
    document.getElementById("confirmselection").style.display = "block";
  }
  document.getElementById("playeroverall").style.display = "none";
  document.getElementById("pleasewait").style.display = "none";
  document.getElementById("options").style.display = "none";
  document.getElementById("Game").style.display = "inline";
  document.getElementById("waittext").innerText = "Please wait for the next round to start.";
  });
}

function getwhite(){
  if(host !== "1"){
    if(playerwhite.length < 10){
      const status = firebase.database().ref('Games/' + newgameid + '/white').child('cards');
      status.once('value', (snapshot) =>{
        let splited = snapshot.val().split("},{");
        white.push(splited);
        let randomwhite = getRandomwhite(white);
        let randomwhite1 = randomwhite.replace('"text":["' , '');
        let randomwhite2 = randomwhite1.replace('"]' , '');
        playerwhite.push(randomwhite2);
        getwhite();
      });
    }

  }else{
    if(playerwhite.length < 10){
        let randomwhite17 = getRandom(white);
        let randomwhite = JSON.stringify(randomwhite17);
        let randomwhite1 = randomwhite.replace('["' , '');
        let randomwhite2 = randomwhite1.replace('"]' , '');
        playerwhite.push(randomwhite2);
        getwhite();
    };
  }
  let innerhtml = "";
  for(i in playerwhite){
    innerhtml = innerhtml + '<div class = "singlebutton"><button class = "whitebutton" id = "' + i + '" onClick="whiteselected('+ i + ');">' + playerwhite[i] + '</button></div>'
  }
    document.getElementById("whiteboxes").innerHTML = innerhtml;
  
};

function whiteselected(id){
  if(lastpicked !== null){
  document.getElementById(lastpicked).style.color = "";
  }
  if(confirmed == "false"){
    if(id !== lastpicked){
      if(lastpicked !== null){
        document.getElementById(lastpicked).classList.add("whitebutton");
       document.getElementById(lastpicked).classList.remove("SelectedWhiteCard");
      }
      document.getElementById(id).classList.add("SelectedWhiteCard");
      document.getElementById(id).classList.remove("whitebutton");
      lastpicked = id;
     
    }
    picked = playerwhite[id];
    document.getElementById("confirmselection").innerHTML = '<button id="confirmselectionpoop" style="display:none;" class="confirmslectionbutton" onclick="selectionconfirmed(' + id + ');">Confirm Selection</button>';
    document.getElementById("confirmselection").style.display = "block";
    document.getElementById("confirmselectionpoop").style.display = "block";
    
  }else{
    alert("you have already picked");
  }
}

function selectionconfirmed(id){
  if(czar == "1" && host == "1"){
    const status = firebase.database().ref('Games/' + newgameid + '/playerstatus/');
    status.on('value', (snapshot) =>{
      string = JSON.stringify(snapshot.val());
      let string1 = string.replace(/"/g,'');
      let string2 = string1.replace("{",'');
      let string3 = string2.replace('}','');
      let string4 = string3.replace("status",'');
      let string5 = string4.replace(":",'');
      let int1 = parseInt(string5);
      if(int1 == (userlist[0].length - 1)){
        firebase.database().ref('Games/'+ newgameid + '/status/').set({
          started : '3',
        });
        selectiontime();
      }
    });
  }else if(czar == "1" && host !== "1"){
    const status = firebase.database().ref('Games/' + newgameid + '/status/');
      status.on('value', (snapshot) =>{
        let check = JSON.stringify(snapshot.val())
        if(check == '{"started":"3"}'){
          selectiontime()
        };
      });
  }else{
  if(alreadyconfirmed == "false"){
  alreadyconfirmed = "true"
  let pickedcard = playerwhite[id];
  let string = null;
  document.getElementById("confirmselectionpoop").style.backgroundColor = "#FD4444";
  document.getElementById("confirmselectionpoop").style.color = "white";
  var x = document.getElementsByClassName('whitebutton');
  var i;
  for (i = 0; i < x.length; i++) {
    x[i].classList.add("whitebuttonselected");
  }
  firebase.database().ref('Games/'+ newgameid + '/pickedwhite/').child(username).set({
    pickedcard,
  });
  if(id > -1){
    playerwhite.splice(id, 1);
  }
  const status = firebase.database().ref('Games/' + newgameid + '/playerstatus/');
  confirmed = "true";
  status.once('value', (snapshot) =>{
    string = JSON.stringify(snapshot.val());
    let string1 = string.replace(/"/g,'');
    let string2 = string1.replace("{",'');
    let string3 = string2.replace('}','');
    let string4 = string3.replace("status",'');
    let string5 = string4.replace(":",'');
    let int1 = parseInt(string5);
    if(string5 == "null"){
      int1 = 0;
    }
    let newint = int1 + 1;
    firebase.database().ref('Games/'+ newgameid + '/playerstatus/').set({
      status : newint,
    });
    if(host == "1"){
      status.on('value', (snapshot) =>{
        string = JSON.stringify(snapshot.val());
        let string1 = string.replace(/"/g,'');
        let string2 = string1.replace("{",'');
        let string3 = string2.replace('}','');
        let string4 = string3.replace("status",'');
        let string5 = string4.replace(":",'');
        let int1 = parseInt(string5);
        let user69 = (userlist[0].length - 1);
        let subtract = null;
        if(user69 == 0){
          subtract = 0;
        }else{
          subtract = 1;
        }
        if(int1 == (userlist[0].length - 1)){
          firebase.database().ref('Games/'+ newgameid + '/status/').set({
            started : '3',
          });
          selectiontime();
        }
      });
    }else{
      const status = firebase.database().ref('Games/' + newgameid + '/status/');
      status.on('value', (snapshot) =>{
        let check = JSON.stringify(snapshot.val())
        if(check == '{"started":"3"}'){
          selectiontime()
        };
      });
    } 
    confirmed = "true";
  });
}
}
}

function selectiontime(){
  let finalhtml = "";
  let selectedwhitecards = [];
  document.getElementById("whiteboxes").style.display = "none";
  if(czar !== "1"){
  document.getElementById("confirmselectionpoop").style.backgroundColor = "";
  document.getElementById("confirmselectionpoop").style.color = "";
  document.getElementById("confirmselectionpoop").style.display = "none";
  }
  document.getElementById("czarnotif").style.display = "none";
  document.getElementById("confirmselection").style.display = "none";
  const status = firebase.database().ref('Games/' + newgameid + '/pickedwhite/');
  status.once('value', (snapshot) =>{
    let picker = JSON.stringify(snapshot.val());
    selectedwhitecards.push(picker.split(','));
    for(i in selectedwhitecards[0]){
      let daid = "'" + "card" + i + "'";
      let selection = [];
      let string1 = selectedwhitecards[0][i];
      let string2 = string1.replace(/{/g , '');
      let string3 = string2.replace(/"/g, '');
      let string4 = string3.replace("pickedcard" , '');
      let string5 = string4.replace(/}/g , '');
      let string6 = string5.split('::');
      selection.push(string6);
      if(czar == "1"){
        let ting = "'" + selection[0][0] + "'"
        finalhtml = finalhtml + '<div class = "selectoverall"><button onclick = "czarselected('+daid + ',' + ting +');" class = "czarselect" id = "' + daid + '"><h1 class = "mainfunny">' + selection[0][1] + '</h1><h1 class = "author" style = "display:none;">'+ selection[0][0] +'</h1></button></div>';
      }else{
        finalhtml = finalhtml + '<div class = "selectoverall"><button class = "select" id = "' + daid + '"><h1 class = "mainfunny">' + selection[0][1] + '</h1><h1 class = "author" style = "display:none;">'+ selection[0][0] +'</h1></button></div>';
      }
    }
    document.getElementById("pickerselection").innerHTML = finalhtml;
    document.getElementById("pickerselection").style.display = "block";
    const status = firebase.database().ref('Games/' + newgameid + '/czarpick/');
    status.on('value', (snapshot) =>{
      if(runpicked == "false"){
        let newval = JSON.stringify(snapshot.val());
        if(newval !== '{"pick":"null"}'){
          czarhaspicked(newval);
          runpicked = "true";
        }
      };
    });
    });
};

function czarselected(skeeid,author){
  skeeid = "'" + skeeid + "'";
  firebase.database().ref('Games/'+ newgameid + '/czarpick/').set({
    pick : skeeid,
  });
  firebase.database().ref('Games/'+ newgameid + '/winner/').set({
    name: author,
  });
}

function czarhaspicked(cardid){
  let newcardid = cardid.replace('{"pick":' , '');
  newcardid = newcardid.replace('}' , '');
  newcardid = newcardid.replace(/"/g , '');
  var xting = document.getElementsByClassName('author');
  var i;
  for (i = 0; i < xting.length; i++) {
    xting[i].style.display="block";
  }
  document.getElementById(newcardid).style.backgroundColor = "#8a720b";
  document.getElementById(newcardid).style.color = "white";
  if(host == "1"){
    const status = firebase.database().ref('Games/' + newgameid + '/winner/');
    status.once('value', (snapshot) =>{
      let one = JSON.stringify(snapshot.val());
      let two = one.replace(/{name:/ , '');
      let three = two.replace('}' , '');
      let finalfour = three.replace(/"/g , '');
      let splitfour = finalfour.split(':');
      let finalfinalpee = splitfour[1];
      const scroe = database.ref('Games/' + newgameid + '/scores/' + finalfinalpee)
      scroe.set({
        score: firebase.database.ServerValue.increment(1),
      });  
  });
}
const scoreboard = firebase.database().ref('Games/' + newgameid + '/scores/');
scoreboard.on('value', (snapshot) =>{
  let scorearray = [];
  let score = JSON.stringify(snapshot.val());
  let score1 = score.replace(/{/g , '');
  let score2 = score1.replace(/"/g , '');
  let score4 = score2.replace(/score/g, '');
  let score5 = score4.replace(/}/g,'');
  let score6 = score5.replace(/::/g, '  ');
  let score7 = score6.split(',');
  scorearray.push(score7);
  console.log(scorearray[0]);
  let final = '';
  for(i in scorearray[0]){
      final = final + '<tr class = "scoremain">' + scorearray[0][i] + '</tr>';
  }
  console.log(final);
  document.getElementById("scoreboard").innerHTML = '<div><table><td>' + final + '</td></table></div>';
});
if(host == "1"){
  setTimeout(() => {  startgame(); }, 10000);
}
}

function leavegame(){
  firebase.database().ref('Games/'+ newgameid + '/players/' + username).remove();
  location.reload();
}



//------------------------------------------------------------------------------------------


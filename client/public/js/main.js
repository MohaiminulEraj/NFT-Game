// MORALIS_APPLICATION_ID and rest of the varibale is coming from frontends env.js file
Moralis.initialize(MORALIS_APPLICATION_ID); // Application id from moralis.io
Moralis.serverURL = MORALIS_SERVER_URL; //Server url from moralis.io
const CONTRACT_ADDRESS = GET_CONTRACT_ADDRESS;

async function init() {
    try {
        let user = await Moralis.Web3.authenticate();
        if (!user) {
            $("#login_button").click(async () => {
                user = await Moralis.Web3.authenticate();
            })
        }
        renderGame();
        console.log(user);
        // alert("User Logged in!");
    } catch (error) {
        console.error(error);
    }

}

async function renderGame() {
    $("#login_button").hide();
    $("#pet_row").html("");
    // Get and Render Properties from Smart Contract
    // window.web3 = await Moralis.Web3.enable();
    await Moralis.enableWeb3();
    let web3 = new window.Web3(Moralis.provider)
    let abi = await getAbi();
    let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    let array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
    if (array.length == 0) return;
    array.forEach(async petId => {
        let details = await contract.methods.getTokenDetails(petId).call({ from: ethereum.selectedAddress });
        renderPet(petId, details);
    })

    $("#game").show();
}

function renderPet(id, data) {
    let now = new Date();
    let maxTime = data.endurance;
    let currentUnix = Math.floor(now.getTime() / 1000);
    let secondsLeft = (parseInt(data.lastMeal) + parseInt(data.endurance)) - currentUnix;
    let percentageLeft = secondsLeft / maxTime;
    let percentageString = (percentageLeft * 100) + "%";
    let deathTime = new Date((parseInt(data.lastMeal) + parseInt(data.endurance)) * 1000);
    if (now > deathTime) {
        deathTime = "<b>Dead</b>";
    }

    let interval = setInterval(() => {
        now = new Date();
        maxTime = data.endurance;
        currentUnix = Math.floor(now.getTime() / 1000);
        secondsLeft = (parseInt(data.lastMeal) + parseInt(data.endurance)) - currentUnix;
        percentageLeft = secondsLeft / maxTime;
        percentageString = (percentageLeft * 100) + "%";
        $(`#pet_${id} .progress-bar`).css("width", percentageString);
        if (percentageLeft < 0) {
            clearInterval(interval);
        }
    }, 5000);

    let htmlString = `
    <div class="col-md-4 card mx-1" id="pet_${id}">
        <img class="card-img-top pet_img" src="/img/cat-2.png" alt="cute kitty">
        <div class="card-body">
            <div>Id: <span class="pet_id">${id}</span></div>
            <div>Damage: <span class="pet_damage">${data.damage}</span></div>
            <div>Magic: <span class="pet_magic">${data.magic}</span></div>
            <div>Endurance: <span class="pet_endurance">${data.endurance}</span></div>
            <div>Time to starvation: <span class="pet_starvation_time">${deathTime}</span></div>
            <div class="progress">
                <div class="progress-bar bg-danger" style="width: ${percentageString};">
                    
                </div>
            </div>
            <button data-pet-id="${id}" class="btn btn-primary btn-block feed_button mt-1">Feed</button>
        </div>
    </div>`;
    let element = $.parseHTML(htmlString);
    $("#pet_row").append(element);

    $(`#pet_${id} .feed_button`).click(() => {
        feed(id);
    });
}

function getAbi() {
    return new Promise((res) => {
        $.getJSON("/token", ((json) => {
            res(json.abi);
        }))
    })
}

async function feed(petId) {
    let web3 = new window.Web3(Moralis.provider);
    let abi = await getAbi();
    let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    let data = await contract.methods.feed(petId).send({ from: ethereum.selectedAddress }).on("receipt", (() => {
        console.log("Feeding...");
        renderGame();
        window.location.reload();
    }));
    console.log(data);
}




init();
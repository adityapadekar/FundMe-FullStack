import { ethers } from "./ethers-5.1.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const metaMaskCheck = typeof window.ethereum !== "undefined";

const btn_connect = document.getElementById("btn_connect");
const btn_fund = document.getElementById("btn_fund");
// const btn_balance = document.getElementById("btn_balance");
// const btn_withdraw = document.getElementById("btn_withdraw");
btn_connect.onclick = connect;
btn_fund.onclick = fund;
// btn_balance.onclick = getBalance;
// btn_withdraw.onclick = withdraw;

async function connect() {
    // Check MetaMask exist

    if (metaMaskCheck) {
        try {
            console.log("hiii");
            await window.ethereum.request({ method: "eth_requestAccounts" });
            btn_connect.innerHTML = "Connected";
        } catch (error) {
            console.log(error);
        }
    } else {
        btn_connect.innerHTML = "Please install MetaMask";
    }
}

async function fund() {
    // const ethAmount = document.getElementById("ethAmount").value
    const ethAmount = "10";
    console.log(`Funding with ${ethAmount}`);
    if (metaMaskCheck) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log(signer);
        const fundMe_contract = new ethers.Contract(
            contractAddress,
            abi,
            signer
        );
        const txResponse = await fundMe_contract.fund({
            value: ethers.utils.parseEther(ethAmount),
        });
    }
}

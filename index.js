const WebSocket = require('ws');

const MYPV_SERIAL = "2003002508200029"; 
const MYPV_TOKEN = "my8f71d00a84cea64fd736dcf7969155a3eaad4d41a5401ePV";                  
const POLL_INTERVAL = 30000;

const HCU_WS_URL = process.env.HCU_CONNECT_API_WS_URL || "ws://localhost:9001";
const HCU_TOKEN = process.env.HCU_CONNECT_API_TOKEN;

console.log("Starte my-PV Plugin...");

const ws = new WebSocket(HCU_WS_URL, {
    headers: { "Authorization": `Bearer ${HCU_TOKEN}` }
});

ws.on('open', () => {
    console.log("Verbunden.");
    fetchWiFiMeterCloudData();
    setInterval(fetchWiFiMeterCloudData, POLL_INTERVAL);
});

async function fetchWiFiMeterCloudData() {
    try {
        const response = await fetch(`https://api.my-pv.com/api/v1/device/${MYPV_SERIAL}/data`, {
            headers: { 'Authorization': MYPV_TOKEN }
        });
        if (!response.ok) throw new Error(`API Fehler!`);
        
        const result = await response.json();
        const currentPower = result.data?.power || 0;
        const totalEnergy = result.data?.act_energy || 0;

        ws.send(JSON.stringify({
            "type": "DEVICE_VALUE_UPDATE",
            "deviceId": "mypv_meter_01",
            "channelId": "main_channel",
            "values": {
                "POWER_VALUE": currentPower,
                "ENERGY_COUNTER": totalEnergy
            }
        }));
    } catch (error) {
        console.error("Fehler:", error.message);
    }
}

const categories = {
  "DC Motor": "To build a DC motor, you need a magnet, a coil of copper wire, and a battery. Create a simple rotating shaft setup and connect the wire ends to the battery terminals.",
  "Drone": "To make a drone, use a flight controller, 4 brushless motors, ESCs, a frame, battery, and propellers. Assemble parts and flash firmware like Betaflight.",
  "Solar Fan": "Connect a small DC fan to a solar panel. Ensure the voltage of the panel matches the fan. Mount the setup inside a box or on a board.",
  "Wind Turbine": "Use a DC motor as a generator, mount blades to the shaft, and place it on a pole. Connect wires to LEDs or battery for storage.",
  "Electric Car": "Use motors, wheels, battery, and controller. Design a frame with switch-based direction and motor mount. Add steering using servo or gears.",
  "Bluetooth Speaker": "Use an audio amplifier module, Bluetooth module, rechargeable battery, and a speaker driver. Connect and enclose it inside a box.",
  "Wireless Charger": "Use an induction coil module. Connect transmitter coil to a 5V source and receiver to a rechargeable battery circuit.",
  "Laser Alarm": "Use a laser pointer, LDR sensor, and buzzer. Align laser to the LDR. If the beam breaks, buzzer is triggered via a transistor.",
  "Vacuum Cleaner": "Use a high-speed DC motor, fan blades, container and filter. Assemble a handle and plug into a power source.",
  "Water Pump": "Use a DC motor with plastic tubing, and create an impeller inside a housing. Seal well to avoid leaks.",
  "Flashlight": "Use an LED, resistor, battery, and switch. Enclose it in a tube with reflector for better focus.",
  "RFID Door Lock": "Use Arduino, RFID reader, servo motor, and tag. When valid tag is detected, servo unlocks the latch.",
  "Mini Fridge": "Use a Peltier module, heat sink, fan, and power source. Sandwich the module between heat sinks with fan cooling.",
  "Sound Sensor Light": "Use a sound sensor and Arduino to detect clap or sound, then turn on/off an LED or bulb via relay.",
  "Motion Sensor Alarm": "Use PIR sensor and buzzer. When motion is detected, it triggers the buzzer using a transistor or microcontroller.",
  "3D Hologram": "Use 4 transparent plastic panels arranged in a pyramid shape. Play hologram video to project a floating 3D image.",
  "Electronic Safe": "Use a keypad, Arduino, and servo motor. When correct pin is entered, servo unlocks the latch of the safe.",
  "Smart Plant Waterer": "Use soil moisture sensor, Arduino, relay module and small water pump. Auto-waters when soil is dry.",
  "Coin Separator": "Use slanted platform with different hole sizes or weights to sort coins by diameter or mass.",
  "Wireless Electricity": "Use Tesla coil principle with high-frequency transformer and secondary coil to transmit low-wattage energy wirelessly."
};

// Create and display categories
const categoryContainer = document.querySelector(".categories");
const projectSection = document.querySelector(".project");

for (let name in categories) {
  const div = document.createElement("div");
  div.className = "category";
  div.textContent = name;
  div.onclick = () => showProject(name);
  categoryContainer.appendChild(div);
}

function showProject(name) {
  categoryContainer.style.display = "none";
  projectSection.classList.add("active");
  projectSection.innerHTML = `
    <h2>${name}</h2>
    <p>${categories[name]}</p>
    <button class="back-btn" onclick="goBack()">← Back to Categories</button>
  `;
}

function goBack() {
  projectSection.classList.remove("active");
  categoryContainer.style.display = "grid";
}
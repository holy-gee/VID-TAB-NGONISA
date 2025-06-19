// Data for 20 invention categories, each with multiple projects
const data = {
  "DC Motor": [
    {
      title: "Basic DC Motor",
      description: "Learn how to build a simple DC motor using magnets, wire, and batteries."
    },
    {
      title: "High Torque DC Motor",
      description: "Step-by-step guide to create a high torque DC motor with improved efficiency."
    }
  ],
  "Drone": [
    {
      title: "DIY Quadcopter Drone",
      description: "Build your own quadcopter drone with a camera and remote control."
    },
    {
      title: "Drone Flight Controller",
      description: "How to make a flight controller for your custom drone."
    }
  ],
  "Solar Inventions": [
    {
      title: "Solar Phone Charger",
      description: "Create a portable solar charger for your phone."
    },
    {
      title: "Solar Water Heater",
      description: "Build an efficient solar water heating system for your home."
    }
  ],
  "Robotics": [
    {
      title: "Line Following Robot",
      description: "Construct a robot that follows a line using sensors."
    },
    {
      title: "Obstacle Avoidance Robot",
      description: "Design a robot that detects and avoids obstacles autonomously."
    }
  ],
  "3D Printing": [
    {
      title: "Basic 3D Printer",
      description: "Instructions for assembling a basic 3D printer at home."
    },
    {
      title: "3D Printed Prosthetics",
      description: "How to design and print affordable prosthetic limbs."
    }
  ],
  "Home Automation": [
    {
      title: "Smart Light Control",
      description: "Automate your home lights with sensors and Arduino."
    },
    {
      title: "Voice Controlled Devices",
      description: "Implement voice commands for home appliances."
    }
  ],
  "Renewable Energy": [
    {
      title: "Wind Turbine",
      description: "DIY wind turbine for generating electricity."
    },
    {
      title: "Hydroelectric Generator",
      description: "How to build a small hydroelectric generator."
    }
  ],
  "Wearable Tech": [
    {
      title: "Fitness Tracker",
      description: "Build a simple wearable fitness tracker."
    },
    {
      title: "Smartwatch",
      description: "Design and assemble your own smartwatch."
    }
  ],
  "Electric Vehicles": [
    {
      title: "Electric Bike Conversion",
      description: "Convert a normal bicycle to electric."
    },
    {
      title: "Solar-Powered Car",
      description: "DIY solar-powered car model project."
    }
  ],
  "Gadgets": [
    {
      title: "DIY Bluetooth Speaker",
      description: "Create a portable Bluetooth speaker from scratch."
    },
    {
      title: "Wireless Charger",
      description: "How to make your own wireless charging pad."
    }
  ],
  "Sensors": [
    {
      title: "Temperature Sensor",
      description: "Build a digital temperature sensor device."
    },
    {
      title: "Motion Detector",
      description: "Create a motion detector alarm system."
    }
  ],
  "3D Modeling": [
    {
      title: "Basic 3D Model Design",
      description: "Learn 3D modeling using free software."
    },
    {
      title: "Advanced 3D Sculpting",
      description: "Techniques for detailed 3D sculpting."
    }
  ],
  "AI Projects": [
    {
      title: "Chatbot",
      description: "Build a simple AI chatbot using JavaScript."
    },
    {
      title: "Image Recognition",
      description: "Create an image recognition app with TensorFlow.js."
    }
  ],
  "DIY Electronics": [
    {
      title: "LED Cube",
      description: "Build a 3D LED cube with Arduino."
    },
    {
      title: "Digital Clock",
      description: "Create a digital clock with seven-segment displays."
    }
  ],
  "Hydraulics": [
    {
      title: "Hydraulic Arm",
      description: "Construct a working hydraulic robotic arm."
    },
    {
      title: "Hydraulic Lift",
      description: "Build a hydraulic lift mechanism."
    }
  ],
  "Optics": [
    {
      title: "DIY Microscope",
      description: "How to build a simple microscope at home."
    },
    {
      title: "Laser Communication",
      description: "Set up a laser communication system."
    }
  ],
  "Energy Storage": [
    {
      title: "Homemade Battery",
      description: "Create a battery using household materials."
    },
    {
      title: "Supercapacitor",
      description: "Build a supercapacitor for energy storage."
    }
  ],
  "Mechatronics": [
    {
      title: "Automated Door",
      description: "DIY automated door with sensor control."
    },
    {
      title: "Self-Balancing Robot",
      description: "Build a robot that balances itself."
    }
  ],
  "NanoTech": [
    {
      title: "Nanoparticles Synthesis",
      description: "Simple methods to synthesize nanoparticles."
    },
    {
      title: "Nano Sensors",
      description: "Design nanoscale sensors."
    }
  ],
  "Drones": [
    {
      title: "Basic Drone Assembly",
      description: "Assemble a drone from components."
    },
    {
      title: "Drone Navigation",
      description: "Program drone navigation algorithms."
    }
  ]
};

// Elements
const categoriesContainer = document.querySelector(".categories-container");
const projectsSection = document.getElementById("projects");
const categoryTitle = document.getElementById("category-title");
const projectList = document.querySelector(".project-list");
const backBtn = document.querySelector(".back-btn");

// Render categories on load
function renderCategories() {
  categoriesContainer.innerHTML = "";
  for (const category in data) {
    const card = document.createElement("div");
    card.className = "category-card";
    card.textContent = category;
    card.onclick = () => showProjects(category);
    categoriesContainer.appendChild(card);
  }
  projectsSection.classList.add("hidden");
}

// Show projects for selected category
function showProjects(category) {
  categoryTitle.textContent = category;
  projectList.innerHTML = "";

  const projects = data[category];
  projects.forEach(proj => {
    const projDiv = document.createElement("div");
    projDiv.className = "project-card";

    const title = document.createElement("h3");
    title.textContent = proj.title;

    const desc = document.createElement("p");
    desc.textContent = proj.description;

    projDiv.appendChild(title);
    projDiv.appendChild(desc);

    projectList.appendChild(projDiv);
  });

  projectsSection.classList.remove("hidden");
  categoriesContainer.style.display = "none";
}

// Back to categories
backBtn.onclick = () => {
  projectsSection.classList.add("hidden");
  categoriesContainer.style.display = "grid";
}

// Initialize app
renderCategories();
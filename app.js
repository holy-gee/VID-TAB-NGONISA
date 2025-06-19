const data = {
  "DC Motor": [
    {
      title: "Basic DC Motor",
      description: "Build a simple DC motor using a battery, magnet, and wire coil. The electric current creates a magnetic field that spins the coil."
    },
    {
      title: "Brushless DC Motor",
      description: "A more efficient motor without brushes. Uses permanent magnets and electronic control to spin the rotor."
    }
  ],
  "Drone": [
    {
      title: "Quadcopter Drone",
      description: "Build a quadcopter drone using four rotors controlled by a flight controller and powered by a LiPo battery."
    },
    {
      title: "Fixed Wing Drone",
      description: "A drone with wings for fixed flight, designed for longer flight time and better aerodynamics."
    }
  ],
  "Solar Power": [
    {
      title: "Solar Panel Setup",
      description: "Learn to connect solar panels to a battery and inverter to power your home devices."
    },
    {
      title: "Solar Water Heater",
      description: "Build a solar water heater using black tubing and a transparent cover to trap heat."
    }
  ],
  // Add more categories and projects as you like
};

// DOM Elements
const categoriesContainer = document.getElementById("categories-container");
const projectsSection = document.getElementById("projects-section");
const projectsBackBtn = document.getElementById("projects-back-btn");
const categoryTitle = document.getElementById("category-title");
const projectList = document.getElementById("project-list");

const detailsSection = document.getElementById("details");
const detailsBackBtn = document.getElementById("details-back-btn");
const detailsTitle = document.getElementById("details-title");
const detailsContent = document.getElementById("details-content");

const categoriesSection = document.getElementById("categories-section");

// Show categories on load
function showCategories() {
  categoriesContainer.innerHTML = "";
  for (const category in data) {
    const div = document.createElement("div");
    div.className = "category-card";
    div.textContent = category;
    div.onclick = () => showProjects(category);
    categoriesContainer.appendChild(div);
  }
  categoriesSection.classList.remove("hidden");
  projectsSection.classList.add("hidden");
  detailsSection.classList.add("hidden");
}

// Show projects in selected category
function showProjects(category) {
  categoryTitle.textContent = category;
  projectList.innerHTML = "";

  data[category].forEach(project => {
    const div = document.createElement("div");
    div.className = "project-card";

    const title = document.createElement("h3");
    title.textContent = project.title;

    const desc = document.createElement("p");
    desc.textContent = project.description;

    div.appendChild(title);
    div.appendChild(desc);

    div.onclick = () => showDetails(category, project);

    projectList.appendChild(div);
  });

  categoriesSection.classList.add("hidden");
  projectsSection.classList.remove("hidden");
  detailsSection.classList.add("hidden");
}

// Show project details
function showDetails(category, project) {
  detailsTitle.textContent = project.title;
  detailsContent.textContent = project.description + "\n\n[Here you can add full detailed instructions, images, or videos on how to build it.]";

  categoriesSection.classList.add("hidden");
  projectsSection.classList.add("hidden");
  detailsSection.classList.remove("hidden");
}

// Back buttons
projectsBackBtn.onclick = () => {
  showCategories();
};

detailsBackBtn.onclick = () => {
  projectsSection.classList.remove("hidden");
  detailsSection.classList.add("hidden");
};

// Initialize on page load
showCategories();
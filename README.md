# Multi-Drone Collision-Free 3D Path Planning

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white)
![Plotly](https://img.shields.io/badge/Plotly-3F4F75?style=for-the-badge&logo=plotly&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)

A capstone project that simulates and plans optimal, collision-free 3D paths for multiple drones operating simultaneously in a dense urban environment. This system leverages a Quantum-Inspired Particle Swarm Optimization (QPSO) algorithm and real-world OpenStreetMap (OSM) data of Berlin to create realistic scenarios and deconflicted routes.

**Demo Visualization:**

*(Recommended: Add a GIF of your Plotly or Three.js visualization here)*
![3D Path Planning Demo](httpsimg.png)

---
## Key Features

* **🏙️ Real-World 3D Environment:** Loads and rasterizes real building footprint and height data from a Berlin OSM file to create a realistic 3D grid for collision detection.
* **🤖 Advanced Pathfinding:** Implements a Quantum-Inspired Particle Swarm Optimization (QPSO) algorithm with a complex fitness function that penalizes building collisions, drone proximity, altitude violations, and path inefficiency.
* **✈️ Multi-Drone Deconfliction:** Employs a `MultiDroneCoordinator` that uses sequential planning and altitude segregation. Each drone's completed path is registered as a dynamic obstacle for all subsequent drones, guaranteeing zero conflicts.
* **📊 Scenario Analysis:** Defines, runs, and validates 8 complex conflict scenarios (e.g., head-on, overtake, vertical conflict) to test the system's robustness.
* **🌐 Interactive Visualization:** Generates 4-panel analysis charts with Matplotlib and interactive 3D visualizations with Plotly. Includes functionality to export all path and building data to JSON for a `Three.js`-based web viewer.

---
## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Core Algorithm** | Quantum-Inspired Particle Swarm Optimization (QPSO) |
| **Data & Geospatial** | Python, NumPy, Pandas, GeoPandas, Pyrosm, Shapely |
| **Visualization** | Matplotlib, Plotly, Three.js (Data Export) |
| **Environment** | Jupyter Notebook |
| **Core Python Libs** | `scipy.spatial`, `pyproj`, `tqdm` |

---
## Screenshots

*Screenshots from the project's analysis and visualization notebooks.*

**4-Panel Drone Analysis**
*(Add your Matplotlib screenshot here)*
<img src="https://i.imgur.com/your-matplotlib-chart.png" width="400" />

**Interactive 3D Scenario (Plotly)**
*(Add your Plotly screenshot here)*
<img src="https://i.imgur.com/your-plotly-chart.png" width="400" />

---
## Local Setup and Installation

To run this project locally, you will need Python and Jupyter.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/madhavmuktesh/Your-Repo-Name.git](https://github.com/madhavmuktesh/Your-Repo-Name.git)
    cd Your-Repo-Name
    ```
2.  **Install dependencies:**
    (It is recommended to use a virtual environment)
    ```bash
    pip install numpy pandas matplotlib pyrosm geopandas shapely plotly jupyter scipy tqdm
    ```
    *Alternatively, you can create a `requirements.txt` file and run `pip install -r requirements.txt`*

3.  **Download Geospatial Data:**
    This project requires the `berlin-250930.osm.pbf` data file.
    * Download the file (e.g., from Geofabrik).
    * Place it in the correct directory as referenced by the `spcapstone.ipynb` notebook.

4.  **Run the Jupyter server:**
    ```bash
    jupyter notebook
    ```
    Open `spcapstone.ipynb` in your browser and run the cells sequentially to see the environment creation, path planning, and visualizations.

---
## Challenges & Learnings

A key challenge was designing an effective fitness function for the QPSO algorithm. It needed to balance multiple competing objectives: path length, smoothness, vertical change, and (most importantly) collision avoidance. This was solved by implementing a heavily weighted penalty system for any path segment that collided with a building or another drone's path.

Another significant challenge was managing the deconfliction of multiple drones. A simple simultaneous optimization was computationally prohibitive. I solved this by implementing a sequential planning system where each drone's path is planned one by one, and each newly planned path is immediately registered as a "dynamic obstacle" in the 3D environment for all subsequent drones to avoid.

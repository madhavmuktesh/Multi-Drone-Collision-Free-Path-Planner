# Multi-Drone Collision-Free 3D Path Planning

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white)
![Plotly](https://img.shields.io/badge/Plotly-3F4F75?style=for-the-badge&logo=plotly&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

A capstone project that simulates and plans optimal, collision-free 3D paths for multiple drones operating simultaneously in a dense urban environment. This system leverages a Quantum-Inspired Particle Swarm Optimization (QPSO) algorithm and real-world OpenStreetMap (OSM) data of Berlin to create realistic scenarios and deconflicted routes.


## Key Features

* **🏙️ Real-World 3D Environment:** Loads and rasterizes real building footprint and height data from a Berlin OSM file to create a realistic 3D grid for collision detection.
* **🤖 Advanced Pathfinding:** Implements a Quantum-Inspired Particle Swarm Optimization (QPSO) algorithm with a complex fitness function that penalizes building collisions, drone proximity, altitude violations, and path inefficiency.
* **✈️ Multi-Drone Deconfliction:** Employs a `MultiDroneCoordinator` that uses sequential planning and altitude segregation. Each drone's completed path is registered as a dynamic obstacle for all subsequent drones, guaranteeing zero conflicts.
* **📊 Scenario Analysis:** Defines, runs, and validates 8 complex conflict scenarios (e.g., head-on, overtake, vertical conflict) to test the system's robustness.
* **🌐 Interactive Visualization:** Generates 4-panel analysis charts with Matplotlib and interactive 3D visualizations with Plotly. Includes functionality to export all path and building data to JSON for a `Three.js`-based web viewer.

---

## Tech Stack

| Category              | Technology                                          |
| :-------------------- | :-------------------------------------------------- |
| **Core Algorithm**    | Quantum-Inspired Particle Swarm Optimization (QPSO) |
| **Data & Geospatial** | Python, NumPy, Pandas, GeoPandas, Pyrosm, Shapely   |
| **Visualization**     | Matplotlib, Plotly, Three.js (Data Export)          |
| **Environment**       | Jupyter Notebook                                    |
| **Core Python Libs**  | `scipy.spatial`, `pyproj`, `tqdm`                   |

---

## Screenshots

*Screenshots from the project's analysis and visualization notebooks.*

4-Panel Drone Analysis

<img width="1000" height="500" alt="file_2025-11-09_00 46 57" src="https://github.com/user-attachments/assets/730e487b-df1d-4c9a-8528-ef19c85c90d2" />


**Interactive 3D Scenario (Plotly)**

<img width="1000" height="500" alt="file_2025-11-09_00 48 27" src="https://github.com/user-attachments/assets/be92c638-2743-4438-92b6-44f38f97b92d" />


---

## Local Setup and Installation

To run this project locally, you will need Python (3.9+) and Jupyter.

1. **Clone the repository:**

```bash
git clone https://github.com/madhavmuktesh/Multi-Drone-Collision-Free-Path-Planner
.git
cd Multi-Drone-Collision-Free-Path-Planner

```

2. **Create a virtual environment (recommended):**

```bash
python -m venv .venv
source .venv/bin/activate   # macOS / Linux
.\.venv\Scripts\activate  # Windows (PowerShell)
```

3. **Install dependencies:**

Create a `requirements.txt` (example below) and then run:

```bash
pip install -r requirements.txt
```

**Example `requirements.txt`:**

```
numpy
pandas
matplotlib
pyrosm
geopandas
shapely
plotly
jupyter
scipy
tqdm
```

4. **Download Geospatial Data:**

This project requires a Berlin OSM file (example filename: `berlin-250930.osm.pbf`).

* Download the file (e.g., from Geofabrik: [https://download.geofabrik.de/](https://download.geofabrik.de/)).
* Place it in the `data/` directory or update the notebook path to where you placed it.

5. **Run the Jupyter server:**

```bash
jupyter notebook
```

Open `path.ipynb` and run the cells sequentially. If cells depend on long-running preprocessing (OSM parsing), consider running those first.

---

## Notable Implementation Notes & Tips

* **Fitness Function:** Use large penalty weights for collisions (building or inter-drone) to force feasible solutions before optimizing secondary objectives like smoothness or length.
* **Sequential Planning:** The current approach plans drones one-by-one and registers completed paths as dynamic obstacles for subsequent planners. This reduces computation compared to simultaneous multi-agent planning but is order-dependent. Consider randomized order runs to reduce bias.
* **Exporting for Three.js:** Export building meshes and drone waypoints as compact JSON (coordinates in WGS84 or projected CRS with metadata). Keep file sizes small by downsampling building polygons for web visualization.

---

## Challenges & Learnings

Designing an effective fitness function was the main challenge — balancing length, smoothness, altitude change, and collision avoidance required careful weighting and feature engineering. Managing multi-drone deconfliction was made efficient via sequential planning and altitude segregation.



* convert this README into a `README.md` file in your repo and commit it (I can provide the `git` commands);
* prepare a `requirements.txt` or `environment.yml` for Conda;
* generate example `assets/` placeholders you can replace with your real screenshots/GIFs.

Tell me which of these you'd like next.

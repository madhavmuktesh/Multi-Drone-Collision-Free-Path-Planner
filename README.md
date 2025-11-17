# Multi-Drone Collision-Free 3D Path Planning in Urban Environments

This project presents a simulation and planning system for generating collision-free 3D paths for multiple drones operating simultaneously in a dense urban environment. Using real-world OpenStreetMap (OSM) data for Berlin, it constructs a 3D grid and employs a **Quantum-Inspired Particle Swarm Optimization (QPSO)** algorithm to find optimal, deconflicted routes for complex scenarios.

---

### 3D Visualization Demo

*(**Recommendation:** Record a short GIF or video of your Plotly or Three.js visualization and place it here. This is the best way to showcase your project!)*

![3D Path Planning Demo](httpsimg.png)
*(Placeholder: A 3D render from your Plotly visualization would be perfect here)*

---

## Key Features

* **Real-World 3D Environment:** Loads and rasterizes real building footprint and height data from a Berlin OSM file (`.osm.pbf`) to create a realistic 3D grid for collision detection.
* **Advanced Pathfinding Algorithm:** Implements a Quantum-Inspired Particle Swarm Optimization (QPSO) algorithm with a sophisticated fitness function that penalizes building collisions, drone proximity, altitude violations, and path inefficiency.
* **Multi-Drone Deconfliction:** Engineers a `MultiDroneCoordinator` that uses sequential planning and altitude segregation. Each drone's completed path is registered as a dynamic obstacle for all subsequent drones, ensuring zero collisions.
* **Dynamic Scenarios & Analysis:** Validates the system against 8 complex conflict scenarios (e.g., head-on, overtake, vertical conflict) and analyzes the results.
* **Interactive 3D Visualization:** Visualizes all paths and scenarios using interactive Plotly charts and includes functionality to export all path and building data to JSON for a `Three.js`-based web viewer.

## How It Works: The Planning Pipeline

1.  **Environment Setup:** The `BerlinDroneEnvironment` class loads the `berlin-250930.osm.pbf` file and creates a 3D obstacle grid.
2.  **Coordination:** The `MultiDroneCoordinator` is initialized with a scenario (start/end points for multiple drones).
3.  **Altitude Segregation:** The `AltitudeSegregationManager` assigns a unique, safe flight level (e.g., 40m, 55m) to each drone.
4.  **Sequential Planning (Drone 0):** The QPSO planner finds the optimal path for Drone 0, avoiding only the static buildings.
5.  **Dynamic Obstacle Registration:** Drone 0's path is registered with the environment.
6.  **Sequential Planning (Drone 1):** The QPSO planner finds the optimal path for Drone 1, which is now programmed to avoid all buildings *and* the entire path of Drone 0.
7.  **Repeat:** This process repeats until all drones have a safe, mutually deconflicted path.
8.  **Analysis & Visualization:** All paths are analyzed for safety, efficiency, and altitude compliance, then rendered in Plotly.

## Core Technologies & Libraries

* **Algorithm:** Quantum-Inspired Particle Swarm Optimization (QPSO)
* **Data & Geospatial:** Python, NumPy, Pandas, Pyrosm, GeoPandas, Shapely
* **Visualization:** Matplotlib, Plotly, Three.js (export)
* **Environment:** Jupyter Notebook

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/madhavmuktesh/Your-Repo-Name.git](https://github.com/madhavmuktesh/Multi-Drone-Collision-Free-Path-Planner.git)
    cd Multi-Drone-Collision-Free-Path-Planner
    ```

2.  **Install dependencies:**
    *(You should create a `requirements.txt` file in your project)*
    ```bash
    pip install -r requirements.txt
    ```
    *(Key libraries include: `numpy`, `pandas`, `pyrosm`, `geopandas`, `plotly`, `jupyter`)*

3.  **Download Data:**
    This project requires the `berlin-250930.osm.pbf` data file. Make sure it is placed in the correct directory as referenced by the notebook.

4.  **Run the Notebook:**
    Launch Jupyter and open `path.ipynb`. You can run the cells sequentially to see the environment creation, path planning for all scenarios, and final visualizations.
    ```bash
    jupyter notebook spcapstone.ipynb
    ```

## Author

* **Sai Madhava Muktesh Vallampati**
* [GitHub: @madhavmuktesh](https://github.com/madhavmuktesh)
* [LinkedIn: @madhav-muktesh-vallampati](https://linkedin.com/in/madhav-muktesh-vallampati)

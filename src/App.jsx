import './App.css'
import TriangulationArtApp from "./compoments/TriangulationArtApp/TriangulationArtApp";
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>My Application</h1>
      </header>

      <main>
        {/* Add the triangulation component here */}
        <TriangulationArtApp />
      </main>

      <footer>
        <p>© 2025 A&D Productions</p>
      </footer>
    </div>
  );
}

export default App;